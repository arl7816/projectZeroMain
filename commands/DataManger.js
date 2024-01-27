const general = require("./general");

class DataManager{
    constructor(filePath, key = "JSONFiles/mapper.json"){
        this.filePath = filePath;
        this.data = general.readFile(filePath);
        this.mapper = general.readFile(key);
    }

    get(attribute, keys, empty = null){
        var path = this.mapper[attribute];

        if (path == null){
            throw Error("Not a valid attribute");
        }

        var pathAry = path.split('->');

        //if (pathAry[pathAry.length - 1] != attribute){throw Error("Path does not lead to correct attribute for " + attribute)}

        if (this.data[pathAry[0]] == null){
            this.data[pathAry[0]] = {}
        }
        var current = this.data[pathAry[0]];
        var keyIndex = 0;
        for (var i = 1; i < pathAry.length-1; i++){
            var name = pathAry[i];

            if (name[0] == '*'){
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

        return current[attribute];
    }

    set(attribute, newValue, keys){
        var path = this.mapper[attribute];
        var pathAry = path.split('->');

        //if (pathAry[pathAry.length - 1] != attribute){throw Error("Path does not lead to correct attribute for " + attribute)}

        if (this.data[pathAry[0]] == null){
            this.data[pathAry[0]] = {}
        }
        var current = this.data[pathAry[0]];
        var keyIndex = 0;
        for (var i = 1; i < pathAry.length-1; i++){
            var name = pathAry[i];

            if (name[0] == '*'){
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

        return current[attribute] = newValue;
    }

    close(){
        general.writeFile(this.data, this.filePath);
    }
}

//var dm = new DataManager("C:/Users/alex/Desktop/VSC/discordBots/discordProjectZero (2)/JSONFiles/test.json", "C:/Users/alex/Desktop/VSC/discordBots/discordProjectZero (2)/JSONFiles/mapper.json");
