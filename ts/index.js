/* obsługa rankingu top 10 graczy */
if (!localStorage.getItem("Space Traders Scoreboard")) {
    localStorage.setItem("Space Traders Scoreboard", JSON.stringify([
        ["Wilko123", 7982],
        ["Julijanka", 6346],
        ["Alpaczka", 2266],
        ["Lisiata", 1832],
        ["Pyzinka", 248]
    ]));
}
var scoreboardIndex = JSON.parse(localStorage.getItem("Space Traders Scoreboard"));
var ranking = document.getElementById('ranking_id');
var data;
var logged = false;
for (var i = 0; i < scoreboardIndex.length; i++) {
    var player = document.createElement("h1");
    player.setAttribute("class", "players_names");
    player.textContent = scoreboardIndex[i][0] + ": " + scoreboardIndex[i][1];
    ranking.appendChild(player);
}
/* Funkcja wyświetla listę planet danej konfiguracji początkowej */
function showPlanets() {
    var planetWindow = document.getElementById("planets_grid_id");
    while (planetWindow.lastChild !== null)
        planetWindow.removeChild(planetWindow.lastChild);
    var header = document.createElement("h1");
    header.setAttribute("class", "headers");
    header.textContent = "Planety";
    planetWindow.appendChild(header);
    for (var planet in data.planets) {
        var element = document.createElement("h1");
        element.textContent = planet;
        planetWindow.appendChild(element);
    }
}
/* Funkcja wyświetla listę statków danej konfiguracji początkowej */
function showShips() {
    var shipsWindow = document.getElementById("ships_grid_id");
    while (shipsWindow.lastChild !== null)
        shipsWindow.removeChild(shipsWindow.lastChild);
    var header = document.createElement("h1");
    header.setAttribute("class", "headers");
    header.textContent = "Statki";
    shipsWindow.appendChild(header);
    for (var ship in data.starships) {
        var element = document.createElement("h1");
        element.textContent = ship;
        shipsWindow.appendChild(element);
    }
}
/* Funkcja wyświetla listę towaróœ danej konfiguracji początkowej */
function showItems() {
    var itemsWindow = document.getElementById("items_grid_id");
    while (itemsWindow.lastChild !== null)
        itemsWindow.removeChild(itemsWindow.lastChild);
    var header = document.createElement("h1");
    header.setAttribute("class", "headers");
    header.textContent = "Dostępne towary";
    itemsWindow.appendChild(header);
    for (var item in data.items) {
        var element = document.createElement("h1");
        element.textContent = data.items[item];
        itemsWindow.appendChild(element);
    }
}
/* funkcja wyświetla popup z informacjami na temat danej konfiguracji początkowej */
function showPopupInfo(name) {
    fetch("/getDescription/" + name)
        .then(function (response) { return response.json(); })
        .then(function (myJson) {
        var dataStructure2 = myJson;
        var jsonString = JSON.stringify(dataStructure2);
        data = JSON.parse(JSON.parse(jsonString));
        console.log(data);
    })
        .then(function () {
        // ustalanie i wyświetlanie nazwy knfiguracji
        var startName = document.getElementById("start_name_id");
        startName.textContent = name;
        // wypisywanie listy planet
        showPlanets();
        // wyświetlanie listy statków
        showShips();
        // wyświetlanie listy towarów dostepnych na planecie
        showItems();
    });
}
/* funkcja wyświetlająca popup rozpoczęcia gry */
function showSelectorPopup() {
    var e;
    fetch("/getStartNames")
        .then(function (response) { return response.json(); })
        .then(function (myJson) {
        var dataStructure2 = myJson;
        var jsonString = JSON.stringify(dataStructure2);
        e = JSON.parse(jsonString);
    })
        .then(function () {
        var select = document.getElementById('names_selector');
        while (select.lastChild !== null)
            select.removeChild(select.lastChild);
        for (var i = 0; i < e.length; i++) {
            var el = document.createElement("option");
            el.setAttribute("value", "\"" + e[i].name + "\"");
            el.textContent = e[i].name;
            select.appendChild(el);
        }
    });
}
/* funkcja odpowiedzilana za obsługę logowania gracza */
function logPlayer() {
    var login = document.getElementById('input_login').value;
    var password = document.getElementById('input_pass').value;
    fetch("/getLogins/" + login + "/" + password)
        .then(function (response) { return response.json(); })
        .then(function (myJson) {
        var dataStructure2 = myJson;
        var jsonString = JSON.stringify(dataStructure2);
        var e = JSON.parse(jsonString);
        if (e.result > 0)
            alert("Zostałeś zalogowany");
        else
            alert("Podano zły login lub hasło");
    })
        .then(function () {
        fetch("/updateLogins/" + login + "/" + password + "/true")
            .then(function (response) { return response.json(); })
            .then(function (myJson) {
            var dataStructure2 = myJson;
            var jsonString = JSON.stringify(dataStructure2);
            var e = JSON.parse(jsonString);
        });
    });
}
/* funkcja sprawdzająca, czy dany plik json zawiera poprawne dane */
function checkIfValidData(file) {
    var data;
    /* sprawdznie, czy jest to obiekt typu json */
    try {
        data = JSON.parse(JSON.parse(file));
    }
    catch (e) {
        return false;
    }
    console.log(typeof (data));
    /* sprawdzenie poprawności kluczy */
    for (var i in data) {
        if (i !== "items" && i !== "planets" && i !== "starships" &&
            i !== "game_duration" && i !== "initial_credits")
            return false;
    }
    /* sprawdzanie wartości kolejnych kluczy */
    if (isNaN(data.initial_credits))
        return false;
    if (isNaN(data.game_duration))
        return false;
    if (data.game_duration <= 0)
        return false;
    if (!check_planets(data.planets, data.items))
        return false;
    if (!check_ships(data.starships, data.planets))
        return false;
    return true;
}
/* funkcja sprawdza poprawność planet z pliku json */
function check_planets(planets, items) {
    for (var planet in planets) {
        var p = planets[planet];
        if (isNaN(p.x))
            return false;
        if (isNaN(p.y))
            return false;
        if (p.y < 0 || p.y > 99)
            return false;
        if (p.x < 0 || p.x > 99)
            return false;
        if (!check_items(items, p))
            return false;
    }
    return true;
}
/* funkcja sprawdza poprawność statków z pliku json */
function check_ships(ships, planets) {
    for (var ship in ships) {
        var p = ships[ship];
        if (isNaN(p.cargo_hold_size))
            return false;
        if (!Object.keys(planets).includes(p.position))
            return false;
    }
    return true;
}
/* funkcja sprawdzająca poprawność załaduknku statku */
function check_items(items, p) {
    var cargo = p.available_items;
    for (var i in cargo) {
        if (!items.includes(i))
            return false;
        if (isNaN(cargo[i].available))
            return false;
        if (cargo[i].available < 0)
            return false;
        if (isNaN(cargo[i].buy_price))
            return false;
        if (isNaN(cargo[i].sell_price))
            return false;
    }
    return true;
}
/* funkcja wczytująca plik załadowany przez gracza */
function readFile(file, callback) {
    var reader = new FileReader();
    reader.onload = function () {
        callback(new String(this.result));
    };
    reader.readAsText(file);
}
/* funkcja wczytująca plik pobrany od użytkownika i wysyłająca go do serwera */
function getFile() {
    var el2;
    var logged = false;
    // sprawdzenie, czy użytkownik jest zalogowany
    fetch("/checkLogged/alpaczka/baboonek")
        .then(function (response) { return response.json(); })
        .then(function (myJson) {
        var dataStructure2 = myJson;
        var jsonString = JSON.stringify(dataStructure2);
        el2 = JSON.parse(jsonString);
    })
        .then(function () {
        if (el2[0].logged === "true")
            logged = true;
    })
        .then(function () {
        if (!logged) {
            alert("W celu dodania pliku musisz się zalogować");
            return;
        }
        var file = document.getElementById('upload_file').files[0];
        var end = false;
        readFile(file, function (fileData) {
            // wczytanie pliku
            var minified = "{}";
            try {
                minified = JSON.stringify(JSON.parse(fileData));
            }
            catch (_a) {
                console.error("JSON is invalid.");
                return;
            }
            // zdobycie nazwy konfiguracji
            var name_to_send = document.getElementById('input_name').value;
            // sprawdzenie, czy nazwa jest unikalna
            fetch("/getNameExisists/" + name_to_send)
                .then(function (response) { return response.json(); })
                .then(function (myJson) {
                var dataStructure2 = myJson;
                var jsonString = JSON.stringify(dataStructure2);
                var e = JSON.parse(jsonString);
                if (e.result > 0) {
                    alert("Dana nazwa już istnieje, wybierz inną nazwę.");
                    end = true;
                }
            })
                .then(function () {
                if (!end) {
                    if (!checkIfValidData(JSON.stringify(fileData))) {
                        alert("Przesłany plik zawiera niepoprawne dane.");
                        end = true;
                    }
                }
                if (!end) {
                    var dataToSend = {
                        "name": name_to_send,
                        "fileData": fileData
                    };
                    console.log(JSON.stringify(dataToSend));
                    fetch("/uploadFile", {
                        method: 'POST',
                        mode: 'cors',
                        cache: 'no-cache',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        redirect: 'follow',
                        referrer: 'no-referrer',
                        body: JSON.stringify(dataToSend)
                    });
                }
            })
                .then(function () {
                if (!end)
                    alert("Twoja konfiguracja została dodana do bazy :)");
            });
        });
    });
}
window.onload = function () {
    var e;
    fetch("/getStartNames")
        .then(function (response) { return response.json(); })
        .then(function (myJson) {
        var dataStructure2 = myJson;
        var jsonString = JSON.stringify(dataStructure2);
        e = JSON.parse(jsonString);
    })
        .then(function () {
        var start = document.getElementById('start_id');
        for (var i = 0; i < e.length; i++) {
            var element = document.createElement("a");
            element.setAttribute("href", "#popup_info");
            var title = document.createElement("h1");
            title.setAttribute("id", "link");
            title.setAttribute("class", "clickable");
            title.textContent = e[i].name;
            title.setAttribute("onclick", "showPopupInfo(\"" + e[i].name + "\")");
            element.appendChild(title);
            start.appendChild(element);
        }
    });
};
