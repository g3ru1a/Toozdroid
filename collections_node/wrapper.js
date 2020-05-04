const Figure = require("./FigureSchema");
const OwnedFigure = require("./OwnedFigureSchema");

exports.newOwnedFigure = async function (userID, figureID, code) {
    let OF = new OwnedFigure({
        userID: userID,
        figureID: figureID,
        code: code
    });
    await OF.save().catch();
}

exports.removeOwnedFigureByUserID = async function (userID) {
    let figs = await OwnedFigure.find({ userID: userID });
    await figs.deleteMany();
};

exports.removeOwnedFigureByFigureID = async function (figureID) {
    let figs = await OwnedFigure.find({ figureID: figureID });
    await figs.deleteMany();
};

exports.removeOwnedFigureByCode = async function (code) {
    let figs = await OwnedFigure.find({ code: code });
    await figs.deleteMany();
};


//#region Figure
exports.newFigure = async function (emoji_id, name) {
    const nf = new Figure({
        name: name,
        emojiID: emoji_id
    });
    await nf.save().catch();
    return nf;
}

exports.updateFigureEmoji = async function (id, emoji_id) {
    await Figure.findByIdAndUpdate(id, { emojiID: emoji_id });
}

exports.updateFigureName = async function (id, name) {
    await Figure.findByIdAndUpdate(id, { name: name });
}

exports.removeFigureByID = async function (id) {
    await Figure.findByIdAndDelete(id);
}

exports.removeFigureByName = async function (name) {
    await Figure.findOneAndDelete({ name: name });
}

exports.getFigureByID = async function (id) {
    let f = await Figure.findById(id);
    return f;
}

exports.getFigureByName = async function (name) {
    let f = await Figure.findOne({ name: name });
    return f;
}

exports.getFigureByEmojiID = async function (emoji_id) {
    let f = await Figure.findOne({ emojiID: emoji_id });
    return f;
}

//#endregion