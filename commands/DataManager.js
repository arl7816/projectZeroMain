const { re, forEach } = require("mathjs");
const general = require("./general");

class DataManager{
    constructor(filePath, key = "JSONFiles/mapper.json"){
        this.filePath = filePath;
        this.data = this.#readFile(filePath);
        this.mapper = this.#readFile(key);
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

    get(attribute, keys, empty = null, attributeName = null, linkage = true){
        var path = this.mapper[attribute];
        if (attribute[0] == '#'){
            attribute = attributeName;
        }

        if (path == null){
            console.log(attribute);
            throw Error("Not a valid attribute");
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

    set(attribute, newValue, keys, attributeName = null){
        var path = this.mapper[attribute];
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

    // updater can take the form: x => x + 1, updater = x => x + 1, or updater = x => {returns x + 1}
    update(attribute, keys, updater, empty=null, attributeName=null){
        var result = this.get(attribute, keys, empty, attributeName);
        this.set(attribute, updater(result), keys, attributeName);
    }

    #getArray(ary){
        var newAry = JSON.parse(JSON.stringify(ary));
        for (let i = 0; i < newAry.length; i++){
            newAry[i].ratingValue = this.get(newAry[i].ratingValue, newAry[i].keys, newAry[i].empty);
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

    updateArray(attribute, id, ratingValue, arrayKeys, ratingKeys, empty = null, attributeName=null){
        var aryCpy = this.get(attribute, arrayKeys, [], attributeName, false);
        if (this.#inArray(aryCpy, id)){return}

        aryCpy.push({id: id, ratingValue: ratingValue, keys: ratingKeys, empty: empty, attributeName: attributeName});
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

//var dm = new DataManager("C:/Users/alex/Desktop/VSC/discordBots/discordProjectZero (2)/JSONFiles/test.json", "C:/Users/alex/Desktop/VSC/discordBots/discordProjectZero (2)/JSONFiles/mapper.json");
