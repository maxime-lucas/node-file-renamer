var fs = require("fs");
var exifParser = require("exif-parser");
var moment = require("moment");
var path = require("path");

function usage() {
	console.log("rename.js <source_directory> <destination_directory>");
}

function checkArguments(srcDirectory, destDirectory) {
	if (srcDirectory == null || dstDirectory == null) {
		usage();
		return 0;
	}

	if (!fs.existsSync(srcDirectory)) {
		console.log("ERROR: Source directory doesn't exist");
		return 0;
	}

	if (!fs.existsSync(dstDirectory)) {
		console.log("ERROR: Destination directory doesn't exist");
		return 0;
	}

	if (!fs.lstatSync(srcDirectory).isDirectory()) {
		console.error("File " + srcDirectory + " is not a directory");
		return 0;
	}

	if (!fs.lstatSync(dstDirectory).isDirectory()) {
		console.error("File " + dstDirectory + " is not a directory");
		return 0;
	}

	return 1;
}

function addZero(data) {
	if (data < 10) data = "0" + data;
	return data;
}

function getCreationDateAsString(fileName) {
	return new Promise((success, failure) => {
		fs.readFile(fileName, function (err, data) {
			if (err) throw err;
			var parser = exifParser.create(data);
			var exif = parser.parse();
			var timestamp = exif.tags.DateTimeOriginal;
			if (!timestamp) return failure(fileName);
			let dateAsString = moment.unix(timestamp).utc().format("YYYYMMDD_HHmmss");
			return success(dateAsString);
		});
	});
}

let myArgs = process.argv.slice(2);
let srcDirectory = myArgs[0];
let dstDirectory = myArgs[1];

if (checkArguments(srcDirectory, dstDirectory)) {
	fs.readdir(srcDirectory, (err, files) => {
		files.forEach((fileName) => {
			console.log("Processing file " + fileName);
			let fileAbsolutePath = srcDirectory + "/" + fileName;
			let fileExt = path.extname(fileAbsolutePath);
			if (fileExt == ".jpg") {
				getCreationDateAsString(fileAbsolutePath)
					.then((creationDate) => {
						let fileNewPath = dstDirectory + "/" + creationDate + ".jpg";
						let i = 1;
						while (fs.existsSync(fileNewPath)) {
							fileNewPath =
								dstDirectory + "/" + creationDate + "_" + i + ".jpg";
							i++;
						}
						fs.copyFile(fileAbsolutePath, fileNewPath, () => {
							console.log(
								"File successfully '" +
									fileAbsolutePath +
									"' copied to '" +
									fileNewPath +
									"'"
							);
						});
					})
					.catch((fileName) => {
						console.log("Error when getting creation date of file " + fileName);
					});
			}
		});
	});
}
