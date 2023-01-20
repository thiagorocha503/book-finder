"use strict";
const API_VERSION = "1";
const BASE_API_URL = "https://www.googleapis.com";
const ENTER_KEY = "Enter";
// pagination
let total = 0;
let limit = 20;
let offset = 0;
let currentQuery = "";
let scrollBlock = false;
$(() => {
    $("#btn-search").on("click", () => {
        search($("#txt-search").val());
    });
    // events
    $(window).on("scroll", () => {
        if (window.innerHeight + window.pageYOffset >=
            document.body.offsetHeight - 50) {
            if (!scrollBlock) {
                offset += limit;
                scrollBlock = true;
                search(currentQuery, offset);
            }
        }
    });
    $("#txt-search").on("keypress", (e) => {
        if (e.code == ENTER_KEY) {
            $("#txt-search").removeClass("is-invalid");
            let feedBack = $("#search-feedback");
            feedBack.removeClass("d-block");
            if ($("#txt-search").val() == "") {
                console.warn("Empty query");
                $("#txt-search").addClass("is-invalid");
                feedBack.addClass("d-block");
                return;
            }
            search($("#txt-search").val());
        }
    });
    function loading() {
        let loading_bottom = document.createElement("div");
        loading_bottom.id = "loading-bottom";
        loading_bottom.style.padding = "8px";
        loading_bottom.classList.add("text-center");
        let img = document.createElement("img");
        img.src = "img/loading.gif";
        loading_bottom.append(img);
        return loading_bottom;
    }
    function search(query, offset = 0) {
        // end result
        if (offset != 0 && offset + limit > total) {
            return;
        }
        let url = `${BASE_API_URL}/books/v${API_VERSION}/volumes?` +
            new URLSearchParams({
                q: query,
                startIndex: `${offset}`,
                maxResults: `${limit}`,
            });
        console.info("[URL] ", url);
        // loading
        if (offset == 0) {
            $("#loading").css("display", "block");
            $("#card-list").html("");
        }
        else {
            $("#loading").css("display", "none");
            // loading bottom
            $("#card-list").append(loading());
        }
        fetch(url, {
            headers: new Headers(),
            method: "GET",
        })
            .then((reponse) => {
            return reponse.json();
        })
            .then((data) => {
            let books = data["totalItems"] != 0 ? data["items"] : [];
            total = data["totalItems"];
            let oldList = $("#card-list");
            $("#loading").css("display", "none");
            $("#loading-bottom").remove();
            if (books.length == 0) {
                let emptyList = document.createElement("div");
                emptyList.id = "card-list";
                emptyList.className = "col mb-4 text-muted";
                emptyList.innerHTML = "No results found";
                oldList.replaceWith(emptyList);
            }
            else {
                if (offset == 0) {
                    oldList.replaceWith(buildListView(books));
                }
                else {
                    let newlist = $("#card-list");
                    for (let i = 0; i < books.length; i++) {
                        let oneCard = buildCard(books[i]);
                        newlist.append(oneCard);
                    }
                }
            }
            currentQuery = query;
            scrollBlock = false;
        })
            .catch((error) => {
            console.log("Erro: ", error);
        });
    }
    function buildListView(books) {
        let cardList = document.createElement("div");
        cardList.className = "col mb-4";
        cardList.id = "card-list";
        books.forEach((book) => {
            let card = buildCard(book);
            cardList.appendChild(card);
        });
        return cardList;
    }
    function buildCard(book) {
        let card = document.createElement("div");
        card.className = "card shadow-sm mb-2";
        card.insertAdjacentHTML("afterbegin", `
        <div class="card-header d-block d-sm-none">
            <h5 class="text-gray">${book["volumeInfo"]["title"]}</h5>
        </div>
        <div class="card-body d-flex">
            <div style="min-width: 128px;">
                <img  class="fluid-img" alt="image not available" src=${book["volumeInfo"]["imageLinks"] != undefined
            ? book["volumeInfo"]["imageLinks"]["smallThumbnail"]
            : "img/thumbnail.png"}>
            </div>
            <div class="px-3 flex-grow-1">
                <h4 class="text-gray d-none d-sm-block">${book["volumeInfo"]["title"]}</h4>
                <div class="d-flex flex-column" >
                    <p class="order-sm-2">
                        ${book["searchInfo"] != undefined
            ? book["searchInfo"]["textSnippet"]
            : ""}
                    </p>
                    <p class="order-sm-1 text-gray text-muted">
                        ${book["volumeInfo"]["authors"] != undefined
            ? book["volumeInfo"]["authors"]
                .map((item, i) => item.trim())
                .join("")
            : "author unknown"}
                        ${book["volumeInfo"]["publishedDate"] != undefined
            ? " | " +
                formatDate(book["volumeInfo"]["publishedDate"])
            : ""}
                    </p>
                </div>
                <a href=${book["volumeInfo"]["infoLink"] != undefined
            ? book["volumeInfo"]["infoLink"]
            : ""} class="btn btn-primary btn-sm text-white" target="_blank" >See more
                </a>
            </div>
        </div>
    `);
        return card;
    }
    function formatDate(date) {
        if (date == null) {
            return "";
        }
        let regex = new RegExp("^\\d{4}-\\d{2}-\\d{2}$");
        if (regex.test(date)) {
            return date.slice(0, 4);
        }
        return date;
    }
});
