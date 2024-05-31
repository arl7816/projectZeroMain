const { re, forEach } = require("mathjs");
const general = require("./general");

let mapperTemplate = {
    "botTotalBits": {path: "o->data->stats->global->bot->bits->botTotalBits: int", empty: 0}, 
    'botTotalSpent': {path: "o->data->stats->global->bot->bits->botTotalSpent: int", empty: 0}, 
    'botVersion': {path: "f->data->stats->global->bot->version: str", empty: ""}, 
    'botLevel': {path: "o->data->stats->global->bot->botLevel: int", empty: 1}, 
    'botXP': {path: "o->data->stats->global->bot->botXP: int", empty: 0}, 
    'botXPneeded': {path: "o->data->stats->global->bot->botXPneeded: int", empty: 100}, 
    
    'totalServers': {path: "o->data->stats->global->servers->totalServers: int", empty: 0}, 
    
    'channelLevel': {path: "o->data->stats->global->servers->*serverId: int->channels->*channelId: int->channelLevel: int", empty: 1}, 
    'channelXP': {path: "o->data->stats->global->servers->*serverId: int->channels->*channelId: int->channelXP: int", empty: 0}, 
    'channelXPneeded': {path: "o->data->stats->global->servers->*serverId: int->channels->*channelId: int->channelXPneeded: int", empty: 100}, 

    'serverLevel': {path: "o->data->stats->global->servers->*serverId: int->serverLevel: int", empty: 1}, 
    'serverXP': {path: "o->data->stats->global->servers->*serverId: int->serverXP: int", empty: 0},
    'serverXPneeded': {path: "o->data->stats->global->servers->*serverId: int->serverXPneeded: int", empty: 100},

    'totalUserMessages': {path: "o->data->stats->personal->*userId: int->messages->totalUserMessages: int", empty: 0}, 
    'totalUserServerMessages': {path: "o->data->stats->personal->*userId: int->messages->servers->*serverId: int->totalUserServerMessages: int", empty: 0}, 
    'totalUserChannelMessages': {path: "o->data->stats->personal->*userId: int->messages->servers->*serverId: int->channels->*channelId: int->totalUserChannelMessages: int", empty: 0}, 
    
    'userLevel': {path: "o->data->stats->personal->*userId: int->userLevel: int", empty: 1}, 
    'userXP': {path: "o->data->stats->personal->*userId: int->userXP: int", empty: 0}, 
    'userXPneeded': {path: "o->data->stats->personal->*userId: int->userXPneeded: int", empty: 100}, 
    'userBits': {path: "o->data->stats->personal->*userId: int->userBits: int", empty: 0}, 
    
    '!topServerBasedMessages': {path: "o->data->stats->personal->*userId: int->messages->servers->topServerBasedMessages: [serverId <=> @totalUserServerMessages]", empty: []}, 
    '!topChannelBasedMessages': {path: "o->data->stats->personal->*userId: int->messages->servers->*serverId: int->channels->topChannelBasedMessages: [channelId <=> @totalUserChannelMessages]", empty: []}, 
    '!topChannelOverallMessages': {path: "o->data->stats->personal->*userId: int->messages->topChannelOverallMessages: [channelId <=> @totalUserChannelMessages]", empty: []}, 
    '!topUsersGlobal': {path: "o->data->stats->global->users->!topUsersGlobal: [userId <=> @userLevel]", empty: 0}, 
    '!topUsersInServer': {path: "o->data->stats->global->servers->*serverId: int->users->!topUsersInServer: [userId <=> @userLevel]", empty: []}, 
    '!topServers': {path: "o->data->stats->global->servers->!topServers: [serverId <=> @serverLevel]", empty: 0}, 
    '!topChannelsInServer': {path: "data->stats->global->servers->*serverId: int->channels->!topChannelsInServer: [channelId <=> @channelLevel]", empty: []}, 
    
    'totalPings': {path: "o->data->stats->personal->*userId: int->messages->pinged->totalPings", empty: 0}, 
    '#userTotalPings': {path: "o->data->stats->personal->*userId: int->messages->pinged->#userTotalPings: int", empty: 0}, 
    '!topPingedUsers': {path: "o->data->stats->personal->*userId: int->messages->pinged->topPingedUsers: [userId <=> @#userTotalPings]", empty: []}, 
    
    'hacksTimeStartTime': {path: "o->hacks->users->*userId->time->*hackName: str->hacksTimeStartTime: int", empty: 0}, 
    
    '#customCommand': {path: "o->commands->personal->custom->*userId: int->#cumand: string", empty: null},
    "#totalPersonalCommand": {path: "o->commands->personal->*userId: int->command->#totalPersonalCommands", empty: 0},
    "!topPersonalCommands": {path: "o->commands->personal->*userId: int->!topPersonalCommands: [command <=> @#tostomComtalPersonalCommand]", empty: []},
    "!topPersonalTypes": {path: "o->commands->personal->*userId: int->!topPersonalTypes: [type <=> @#totalPersonalType]", empty: []},
    "#totalPersonalType": {path: "o->commands->personal->*userId: int->type->#totalPersonalType", empty: 0},
    "totalPersonalCommandsUsed": {path: 'o->commands->personal->*userId: int->totalPersonalCommandsUsed: int', empty: 0},

    "totalCommandsUsed": {path: "o->commands->global->totalCommandsUsed: int", empty: 0},
    "totalGlobalCommandUsed": {path: "o->commands->global->command->*command: str->totalGlobalCommandUsed: int", empty: 0},
    "totalGlobalTypesUsed": {path: "o->commands->global->types->type->*type: str->totalGlobalTypeUsed", empty: 0},

    "!topCommandsUsed": {path: "o->commands->global->!topCommandsUsed: [command <=> @totalGlobalCommandUsed]", empty: []},
    "!topTypesUsed": {path: "o->commands->global->!topTypesUsed: [type <=> @totalGlobalTypesUsed]", empty: []}
}

class DataManager{
    constructor(filePath, key = "JSONFiles/mapper.json"){
        this.filePath = filePath;
        this.data = this.#readFile(filePath);
        this.mapper = mapperTemplate;
    }

    #readFile(fileName = "JSONFiles/data.json"){
        let data = fs.readFileSync(fileName).toString();
    
        //try{data=JSON.parse(data);}catch{}
        data = JSON.parse(data);
    
        return data
    }
    
    // rewrites data into a json file. If no json file is given than the it will use basic data as a default.
    #writeFile(data, fileName = "JSONFiles/data.json"){
        data = JSON.stringify(data, null, "\t");
        fs.writeFileSync(fileName, data);
    }

    /**
     * Gets a attribute from the data file
     * @param {string} attribute => the attribute your looking for
     * @param {*[]} keys => the keys needed to access the attribute
     * ie - id's, names, etc... (NOTE: these are labeled with a * in the mapper)
     * @param {string} attributeName => if its a custom attribute (labeled with a # in the mapper)
     * then is used for the custom attribute. 
     * @param {boolean} linkage => if this is a list (! in the mapper) tells the data manager that 
     * it needs to link attributes within the list to other attributes (@ in the mapper)
     * @returns the desired attribute : any 
     */
    get(attribute, keys, attributeName = null, linkage = true){
        //console.log(attribute);
        if (this.mapper[attribute] == null){
            throw Error(attribute + " is not a valid attribute");
        }

        var path = this.mapper[attribute].path;
        var empty = this.mapper[attribute].empty;
        if (attribute[0] == '#'){
            attribute = attributeName;
        }

        
        var pathAry = path.split('->');

        //if (pathAry[pathAry.length - 1] != attribute){throw Error("Path does not lead to correct attribute for " + attribute)}

        if (this.data[pathAry[1]] == null){
            this.data[pathAry[1]] = {}
        }
        var current = this.data[pathAry[1]];
        var keyIndex = 0;
        for (var i = 2; i < pathAry.length-1; i++){
            var name = pathAry[i];

            if (name[0] == '*'){
                if (keys[keyIndex] == null){throw Error("null id provided")}
                name = keys[keyIndex];
                keyIndex++;
            }

            if (current[name] == null){current[name] = {};}
            current = current[name];
        }

        // should have access to attribute now
        if (current[attribute] == null){
            current[attribute] = empty;
        }

        if (attribute[0] == '!' && linkage){return this.#getArray(current[attribute])}
        return current[attribute];
    }

    /**
     * Sets a new value of an attribute. NOTE: do not use this on a list
     * @param {string} attribute => the attribute being set
     * @param {*} newValue => the new value of the attribute
     * @param {*[]} keys => the keys needed to access the attribute
     * @param {string} attributeName => if its a custom attribute, the name of the attribute
     * @returns the new value upon success : any
     */
    set(attribute, newValue, keys, attributeName = null){
        var path = this.mapper[attribute].path;
        if (attribute[0] == '#'){
            attribute = attributeName;
        }

        var pathAry = path.split('->');

        //if (pathAry[pathAry.length - 1] != attribute){throw Error("Path does not lead to correct attribute for " + attribute)}
        //if (attribute[0] == "!"){throw Error("Must use array specific set")}

        if (this.data[pathAry[1]] == null){
            this.data[pathAry[1]] = {}
        }
        var current = this.data[pathAry[1]];
        var keyIndex = 0;
        for (var i = 2; i < pathAry.length-1; i++){
            var name = pathAry[i];

            if (name[0] == '*'){
                name = keys[keyIndex];
                keyIndex++;
            }

            if (current[name] == null){current[name] = {};}
            current = current[name];
        }

        return current[attribute] = newValue;
    }

    /**
     * Deletes a custom attribute from memory
     * @param {string} attribute => the name of the custom attribute
     * @param {*[]} keys => keys required to get access to the attribute 
     * @param {string} attributeName => the custom name
     */
    deleteAttri(attribute, keys, attributeName){
        if (this.mapper[attribute] == null){
            throw Error(attribute + " is not a valid attribute");
        }

        var path = this.mapper[attribute].path;
        var empty = this.mapper[attribute].empty;

        var pathAry = path.split('->');

        if (this.data[pathAry[1]] == null){
            this.data[pathAry[1]] = {}
        }
        var current = this.data[pathAry[1]];
        var keyIndex = 0;
        for (var i = 2; i < pathAry.length-1; i++){
            var name = pathAry[i];

            if (name[0] == '*'){
                if (keys[keyIndex] == null){throw Error("null id provided")}
                name = keys[keyIndex];
                keyIndex++;
            }

            if (current[name] == null){current[name] = {};}
            current = current[name];
        }

        // // should have access to attribute now
        // if (current[attribute] == null){
        //     current[attribute] = empty;
        // }

        delete current[attributeName];
    }

    /**
     * checks if a pathway exists within the database. 
     * NOTE: this is not used to check if an attribute exist, just the path
     * @param {string} path => the path to be checked
     * @param {*[]} keys => the keys needed for the path 
     * @returns true if the path exists, false otherwise
     */
    checkPath(path, keys){
        var pathAry = path.split('->');
        var result = true;

        if (this.data[pathAry[1]] == null){
            return false;
        }

        var current = this.data[pathAry[1]];
        var keyIndex = 0;
        for (var i = 2; i < pathAry.length; i++){
            var name = pathAry[i];

            if (name[0] == '*'){
                name = keys[keyIndex];
                keyIndex++;
            }

            if (current[name] == null){
                result = false;
                break;
            }
            current = current[name];
        }

        return result;
    }

    /**
     * checks if a attribute exists within the database
     * !!!TODO!!!: still needs testing
     * @param {string} attribute => the attribute being tested
     * @param {*[]} keys => the keys needed to access the attribute
     * @param {string} attributeName => the name of the custom attribute
     * @returns true if the attribute exist, false otherwise
     */
    checkAttri(attribute, keys, attributeName = null){
        if (this.mapper[attribute] == null){
            throw Error(attribute + " is not a valid attribute");
        }

        var path = this.mapper[attribute].path;
        if (attribute[0] == '#'){
            attribute = attributeName;
        }

        var pathAry = path.split('->');

        //if (pathAry[pathAry.length - 1] != attribute){throw Error("Path does not lead to correct attribute for " + attribute)}

        if (this.data[pathAry[1]] == null){
            this.data[pathAry[1]] = {}
        }
        var current = this.data[pathAry[1]];
        var keyIndex = 0;
        for (var i = 2; i < pathAry.length-1; i++){
            var name = pathAry[i];

            if (name[0] == '*'){
                if (keys[keyIndex] == null){throw Error("null id provided")}
                name = keys[keyIndex];
                keyIndex++;
            }

            if (current[name] == null){current[name] = {};}
            current = current[name];
        }

        // should have access to attribute now
        if (current[attribute] == null){
            return false;
        }

        return true;
    }

    /**
     * Updates the value of a attribute (gets then sets)
     * @param {string} attribute => the attribute name
     * @param {*[]} keys => the keys needed to access the attribute
     * @param {Function} updater => some lambda function used to update the value.
     * updater can take the form: x => x + 1, updater = x => x + 1, or updater = x => {returns x + 1} 
     * @param {string} attributeName => the name of the custom attribute if it is one. 
     */
    update(attribute, keys, updater, attributeName=null){
        var result = this.get(attribute, keys, attributeName);
        this.set(attribute, updater(result), keys, attributeName);
    }

    /**
     * Converts each element of an array to its linked attributes
     * @param {string[]} ary => the array being converted
     * @returns the new array
     */
    #getArray(ary){
        var newAry = JSON.parse(JSON.stringify(ary));
        for (let i = 0; i < newAry.length; i++){
            newAry[i].ratingValue = this.get(newAry[i].ratingValue, newAry[i].keys);
        }
        return newAry;
    }


    #inArray(ary, id){
        var result = false;
        for (let i = 0; i < ary.length; i++){
            if (ary[i].id == id){
                result = true;
                break;
            }
        }

        return result;
    }

    updateArray(attribute, id, ratingValue, arrayKeys, ratingKeys, attributeName=null){
        var aryCpy = this.get(attribute, arrayKeys, attributeName, false);
        if (this.#inArray(aryCpy, id)){return}

        aryCpy.push({id: id, ratingValue: ratingValue, keys: ratingKeys, attributeName: attributeName});
        this.set(attribute, aryCpy, arrayKeys, attributeName);
    }

    sortArray(ary){
        ary.sort(function(a,b) {
            return b.ratingValue - a.ratingValue;
        });
        return ary;
    }

    aryGetValue(ary, index){
        return ary[index].ratingValue;
    }

    close(){
        this.#writeFile(this.data, this.filePath);
    }
}

module.exports = DataManager;
