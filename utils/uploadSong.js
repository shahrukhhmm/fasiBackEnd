const uploadFile = async (file) => {
    try {
        const [, fileType, fileData] = file.match(/^data:(.+);base64,(.+)$/);
        const [fileMainType, fileSubType] = fileType.split("/");
        const fileBuffer = Buffer.from(fileData, "base64");
        const fileName = Date.now() + "." + fileSubType;
        let filePath = null;
        let filePathPrefix = null;
        
        if (fileMainType === "image") {
            filePathPrefix = "images/";
            filePath = "public/images/" + fileName;
        } else if (fileMainType === "video") {
            filePathPrefix = "videos/";
            filePath = "public/videos/" + fileName;
        } else if (fileMainType === "audio") {
            // Handle MP3 files
            if (fileSubType === "mpeg") {
                filePathPrefix = "audio/mp3/";
                filePath = "public/audio/mp3/" + fileName;
            }
            // Handle MP4 files
            else if (fileSubType === "mp4") {
                filePathPrefix = "audio/mp4/";
                filePath = "public/audio/mp4/" + fileName;
            } else {
                throw new Error("Unsupported audio file format");
            }
        } else {
            throw new Error("Unsupported file format");
        }
        
        await fs.promises.writeFile(filePath, fileBuffer);
        return filePathPrefix + fileName;
    } catch (err) {
        console.log(err);
        return null;
    }
};
