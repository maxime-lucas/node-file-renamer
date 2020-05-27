var fs = require('fs');
var exifParser = require('exif-parser');

function addZero(data){
    if(data<10)
        data = '0'+data;
    return data;
}

function getCreationDateAsString(fileName){
    return new Promise((success,failure)=>{
        fs.readFile(fileName, function(err,data){
            if(err) throw err;
            var parser = exifParser.create(data);
            var exif = parser.parse();
            var timestamp = exif.tags.DateTimeOriginal;
            if(!timestamp)
                return failure(fileName);
            var date = new Date(timestamp*1000);
            date.setTime(date.getTime()-3600*1000);
            var dd = addZero(date.getDate());
            var mm = addZero(date.getMonth()+1);
            var yyyy = date.getFullYear();
            var hh = addZero(date.getHours());
            var min = addZero(date.getMinutes());
            var sec = addZero(date.getSeconds());
            var dateAsString = '';
            dateAsString += yyyy;
            dateAsString += mm;
            dateAsString += dd;
            dateAsString += hh;
            dateAsString += min;
            dateAsString += sec;
            return success(dateAsString);
        });
    })
}

let myArgs = process.argv.slice(2);
let directory = myArgs[0];

if(directory == null){
    console.log("Missing 'folder' argument")
    return;
}

fs.access(directory, fs.F_OK, (err)=>{
    if(err) {
        console.error(err)
        return;
    }
    if(!fs.lstatSync(directory).isDirectory()) {
        console.error("File "+directory+" is not a directory");
        return;
    }
    fs.readdir(directory,(err,files)=>{
        files.forEach(fileName=>{
            console.log("Processing file "+fileName);
            let fileFullPath = directory+"/"+fileName;
            getCreationDateAsString(fileFullPath).then((creationDate)=>{
                let fileNewPath = directory+"/"+creationDate+".jpg";
               fs.renameSync(fileFullPath,fileNewPath);
            }).catch((fileName)=>{
                console.log("Error when getting creation date of file "+fileName);
            })
        })
    })
})