"use strict";
var API_VERSION = "1";
var BASE_API_URL = "https://www.googleapis.com";
var inputSearch = document.getElementById("txt-search");
var ENTER_KEY = "Enter";
// pagination
var total = 0;
var limit = 20;
var offset = 0;
var currentQuery = "";
var scrollBlock = false;
// events
window.addEventListener("scroll", function () {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 50) {
        if (!scrollBlock) {
            offset += limit;
            scrollBlock = true;
            search(currentQuery, offset);
        }
    }
});
inputSearch.addEventListener("keypress", function (evt) {
    if (evt.code == ENTER_KEY) {
        inputSearch.classList.remove("is-invalid");
        var feedBack = document.getElementById("search-feedback");
        feedBack === null || feedBack === void 0 ? void 0 : feedBack.classList.remove("d-block");
        if (inputSearch.value == "") {
            console.warn("Empty query");
            inputSearch.classList.add("is-invalid");
            feedBack === null || feedBack === void 0 ? void 0 : feedBack.classList.add("d-block");
            return;
        }
        search(inputSearch.value);
    }
});
function onSearch() {
    search(inputSearch.value);
}
function search(query, offset) {
    if (offset === void 0) { offset = 0; }
    // end result
    if (offset != 0 && (offset + limit) > total) {
        return;
    }
    var url = "".concat(BASE_API_URL, "/books/v").concat(API_VERSION, "/volumes?q=").concat(query, "&startIndex=").concat(offset, "&maxResults=").concat(limit);
    console.info(url);
    var xhttp = new XMLHttpRequest();
    xhttp.open("get", url);
    xhttp.onloadstart = function () {
        if (offset == 0) {
            $("#loading").css("display", "block");
            $("#card-list").html("");
        }
        else {
            $("#loading").css("display", "none");
            // loading bottom
            var loading_bottom = document.createElement("div");
            loading_bottom.id = "loading-bottom";
            loading_bottom.style.padding = "8px";
            loading_bottom.classList.add("text-center");
            var img = document.createElement("img");
            img.src = "img/loading.gif";
            loading_bottom.append(img);
            $("#card-list").append(loading_bottom);
        }
    };
    xhttp.onreadystatechange = function (evt) {
        if (xhttp.readyState == 4) {
            console.log("Read state 4: DONE");
            if (xhttp.status == 200) {
                var reponseJSON = JSON.parse(xhttp.responseText);
                var books = reponseJSON["totalItems"] != 0 ? reponseJSON["items"] : [];
                total = reponseJSON["totalItems"];
                var container = document.getElementById("row-result");
                var oldCardList = document.getElementById("card-list");
                $("#loading").css("display", "none");
                $("#loading-bottom").remove();
                if (books.length == 0) {
                    var emptyList = document.createElement("div");
                    emptyList.id = "card-list";
                    emptyList.className = "col mb-4 text-muted";
                    emptyList.innerHTML = "No results found";
                    container.replaceChild(emptyList, oldCardList);
                }
                else {
                    if (offset == 0) {
                        container.replaceChild(buildListCard(books), oldCardList);
                    }
                    else {
                        var list = document.getElementById("card-list");
                        for (var i = 0; i < books.length; i++) {
                            var card = buildCard(books[i]);
                            list === null || list === void 0 ? void 0 : list.appendChild(card);
                        }
                    }
                }
                currentQuery = query;
                scrollBlock = false;
            }
        }
    };
    xhttp.onerror = function (evt) {
        console.error("Status code: " + xhttp.status);
        if (xhttp.status == 404) {
            $("#modal-erro-body").text("Not found resource");
        }
        $("#error-modal").modal("show");
        $("#loading").css("display", "none");
    };
    xhttp.timeout = 3000;
    xhttp.send();
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
    // console.log(book);
    var cardContainer = document.createElement("div");
    cardContainer.className = "card shadow-sm mb-2";
    cardContainer.insertAdjacentHTML("afterbegin", "\n        <div class=\"card-header d-block d-sm-none\">\n            <h5 class=\"text-gray\">".concat(book["volumeInfo"]["title"], "</h5>\n        </div>\n        <div class=\"card-body d-flex\">\n            <div style=\"min-width: 128px;\">\n                <img  class=\"fluid-img\" alt=\"image not available\" src=").concat(book["volumeInfo"]["imageLinks"] != undefined ? book["volumeInfo"]["imageLinks"]["smallThumbnail"] : "img/thumbnail.png", ">\n            </div>\n            <div class=\"px-3 flex-grow-1\">\n                <h4 class=\"text-gray d-none d-sm-block\">").concat(book["volumeInfo"]["title"], "</h4>\n                <div class=\"d-flex flex-column\" >\n                    <p class=\"order-sm-2\">\n                        ").concat(book["searchInfo"] != undefined ? book["searchInfo"]["textSnippet"] : "", "\n                    </p>\n                    <p class=\"order-sm-1 text-gray text-muted\">\n                        ").concat(book["volumeInfo"]["authors"] != undefined ?
        book["volumeInfo"]["authors"].map(function (item, i) { return item.trim(); }).join("") : "author unknown", "\n                        ").concat(book["volumeInfo"]["publishedDate"] != undefined ? " | " + formatDate(book["volumeInfo"]["publishedDate"]) : "", "\n                    </p>\n                </div>\n                <a href=").concat(book["volumeInfo"]["infoLink"] != undefined ? book["volumeInfo"]["infoLink"] : "", " class=\"btn btn-primary btn-sm text-white\" target=\"_blank\" >See more</a>\n            </div>\n        </div>\n    "));
    return cardContainer;
}
function formatDate(date) {
    if (date == null) {
        return "";
    }
    var regex = new RegExp("^\\d{4}\-\\d{2}\-\\d{2}$");
    if (regex.test(date)) {
        return date.substr(0, 4);
    }
    return date;
}
