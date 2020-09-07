"use strict";
var GOOGLE_API_VERSION = "1";
var inputSearch = document.getElementById("txt-search");
var ENTER_KEY = 13;
inputSearch.addEventListener("keypress", function (evt) {
    if (evt.keyCode == ENTER_KEY) {
        onSearch();
    }
});
function search(query) {
    var xmlHtmlResquest = new XMLHttpRequest();
    xmlHtmlResquest.onreadystatechange = function (evt) {
        if (xmlHtmlResquest.readyState == 4) {
            console.log("Read state 4: DONE");
            if (xmlHtmlResquest.status == 200) {
                var reponseJSON = JSON.parse(xmlHtmlResquest.responseText);
                var books = reponseJSON["totalItems"] != 0 ? reponseJSON["items"] : [];
                render(books);
            }
            else {
                console.log(xmlHtmlResquest);
            }
        }
    };
    xmlHtmlResquest.open("get", "https://www.googleapis.com/books/v" + GOOGLE_API_VERSION + "/volumes?q=" + query);
    xmlHtmlResquest.send();
}
function onSearch() {
    inputSearch.classList.remove("is-invalid");
    var feedBack = document.getElementById("search-feedback");
    feedBack === null || feedBack === void 0 ? void 0 : feedBack.classList.remove("d-block");
    if (inputSearch.value == "") {
        console.log("Empty query");
        inputSearch.classList.add("is-invalid");
        feedBack === null || feedBack === void 0 ? void 0 : feedBack.classList.add("d-block");
        return;
    }
    search(inputSearch.value);
}
function render(books) {
    var container = document.getElementById("row-result");
    var oldCardList = document.getElementById("card-list");
    var newCardList = buildListCard(books);
    container.replaceChild(newCardList, oldCardList);
}
function buildListCard(books) {
    var cardList = document.createElement("div");
    cardList.className = "col mb-4";
    cardList.id = "card-list";
    books.forEach(function (book) {
        var card = buildCard(book);
        cardList.appendChild(card);
    });
    return cardList;
}
function buildCard(book) {
    console.log(book);
    var cardContainer = document.createElement("div");
    //${book["volumeInfo"]["imageLinks"]['thumbnail']}
    var imageLinks = book["volumeInfo"]["imageLinks"];
    cardContainer.className = "card shadow-sm mb-2";
    cardContainer.insertAdjacentHTML("afterbegin", "\n        <div class=\"card-body d-flex\">\n            <div>\n                <img class=\"fluid-img\" src=\"" + (imageLinks != null ? imageLinks["smallThumbnail"] : "") + "\">\n            </div>\n            <div class=\"px-3 flex-grow-1\">\n                <h4 class=\"text-gray\">" + book["volumeInfo"]["title"] + "</h4>\n                <p class=\"text-gray text-muted\">by\n                    " + (book["volumeInfo"]["authors"] != undefined ?
        book["volumeInfo"]["authors"].map(function (item, i) { return item.trim(); }).join("") : "Unknow ") + " | \n                    " + (book["volumeInfo"]["publishedDate"] == undefined ? " Unknown" : book["volumeInfo"]["publishedDate"]) + "</p>\n                <p>\n                    " + book["searchInfo"]["textSnippet"] + "\n                </p>\n                <a href=\"" + book["volumeInfo"]["infoLink"] + "\" class=\"btn btn-primary text-white\" target=\"_blank\" >See more</a>\n            </div>\n        </div>\n    ");
    return cardContainer;
}
