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

let scoreboardIndex = JSON.parse(localStorage.getItem("Space Traders Scoreboard"));
let ranking = document.getElementById('ranking_id');
let data;
let logged = false;

for (let i = 0; i < scoreboardIndex.length; i++) {
    let player = document.createElement("h1");
    player.setAttribute("class", "players_names");
    player.textContent = scoreboardIndex[i][0] + ": " + scoreboardIndex[i][1];

    ranking.appendChild(player);
}


/* Funkcja wyświetla listę planet danej konfiguracji początkowej */
function showPlanets() {
    
    let planetWindow = document.getElementById("planets_grid_id");

    while (planetWindow.lastChild !== null)
        planetWindow.removeChild(planetWindow.lastChild);

    let header = document.createElement("h1");
    header.setAttribute("class", "headers");
    header.textContent = "Planety";
    planetWindow.appendChild(header);
    
    for (let planet in data.planets) {
        let element = document.createElement("h1");
        element.textContent = planet;

        planetWindow.appendChild(element);
    }
}


/* Funkcja wyświetla listę statków danej konfiguracji początkowej */
function showShips() {
    
    let shipsWindow = document.getElementById("ships_grid_id");

    while (shipsWindow.lastChild !== null)
        shipsWindow.removeChild(shipsWindow.lastChild);

    let header = document.createElement("h1");
    header.setAttribute("class", "headers");
    header.textContent = "Statki";
    shipsWindow.appendChild(header);
    
    for (let ship in data.starships) {
        let element = document.createElement("h1");
        element.textContent = ship;

        shipsWindow.appendChild(element);
    }
}


/* Funkcja wyświetla listę towaróœ danej konfiguracji początkowej */
function showItems() {

    let itemsWindow = document.getElementById("items_grid_id");

    while (itemsWindow.lastChild !== null)
        itemsWindow.removeChild(itemsWindow.lastChild);

    let header = document.createElement("h1");
    header.setAttribute("class", "headers");
    header.textContent = "Dostępne towary";
    itemsWindow.appendChild(header);
    
    for (let item in data.items) {
        let element = document.createElement("h1");
        element.textContent = data.items[item];

        itemsWindow.appendChild(element);
    }
}


/* funkcja wyświetla popup z informacjami na temat danej konfiguracji początkowej */
function showPopupInfo(name) {

    fetch("/getDescription/" + name)
        .then(function(response) { return response.json(); })
        .then(function(myJson) {
            let dataStructure2 = myJson;
            let jsonString = JSON.stringify(dataStructure2);
            data = JSON.parse(JSON.parse(jsonString));
            console.log(data);
        })
        .then(function() {
            // ustalanie i wyświetlanie nazwy knfiguracji
            let startName = document.getElementById("start_name_id");
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
    let e;

    fetch("/getStartNames")
    .then(function(response) { return response.json(); })
    .then(function(myJson) {
        let dataStructure2 = myJson;
        let jsonString = JSON.stringify(dataStructure2);
        e = JSON.parse(jsonString);
    })
    .then(function() {
        let select = document.getElementById('names_selector');

        while (select.lastChild !== null)
            select.removeChild(select.lastChild);

        for (let i = 0; i < e.length; i++) {
            let el = document.createElement("option");
            el.setAttribute("value", "\"" + e[i].name + "\"");
            el.textContent = e[i].name;
            select.appendChild(el);
        }
    });
}


/* funkcja odpowiedzilana za obsługę logowania gracza */
function logPlayer() {

    let login = (<HTMLInputElement>document.getElementById('input_login')).value;
    let password = (<HTMLInputElement>document.getElementById('input_pass')).value;
    
    fetch("/getLogins/" + login + "/" + password)
    .then(function(response) { return response.json(); })
    .then(function(myJson) {
        let dataStructure2 = myJson;
        let jsonString = JSON.stringify(dataStructure2);
        let e = JSON.parse(jsonString);

        if (e.result > 0)
            alert("Zostałeś zalogowany");
        else
            alert("Podano zły login lub hasło");
    })
    .then(function() {
        fetch("/updateLogins/"  + login + "/" + password + "/true")
        .then(function(response) { return response.json(); })
        .then(function(myJson) {
            let dataStructure2 = myJson;
            let jsonString = JSON.stringify(dataStructure2);
            let e = JSON.parse(jsonString);
        });
    });
}


/* funkcja sprawdzająca, czy dany plik json zawiera poprawne dane */
function checkIfValidData(file) : boolean {

    let data;
    
    /* sprawdznie, czy jest to obiekt typu json */
    try {
        data = JSON.parse(JSON.parse(file));
    } catch (e) {
        return false;
    }

    console.log(typeof(data));

    /* sprawdzenie poprawności kluczy */
    for (let i in data) {
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
function check_planets(planets, items) : boolean {

    for (let planet in planets) {
        let p = planets[planet];
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
function check_ships(ships, planets) : boolean {

    for (let ship in ships) {
        let p = ships[ship];
        if (isNaN(p.cargo_hold_size))
            return false;

        if (!Object.keys(planets).includes(p.position))
            return false;
    }

    return true;
}


/* funkcja sprawdzająca poprawność załaduknku statku */
function check_items(items, p) : boolean {

    let cargo = p.available_items;
    for (let i in cargo) {
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
        callback(new String(this.result as any));
    };
    
    reader.readAsText(file);
}


/* funkcja wczytująca plik pobrany od użytkownika i wysyłająca go do serwera */
function getFile() {

    let el2;
    let logged = false;

    // sprawdzenie, czy użytkownik jest zalogowany
    fetch("/checkLogged/alpaczka/baboonek")
    .then(function(response) { return response.json(); })
    .then(function(myJson) {
        let dataStructure2 = myJson;
        let jsonString = JSON.stringify(dataStructure2);
        el2 = JSON.parse(jsonString);
    })
    .then(function() {
        if (el2[0].logged === "true")
            logged = true;
    })
    .then(function() {

    if (!logged) {
        alert("W celu dodania pliku musisz się zalogować");
        return;
    }

    var file = (<HTMLInputElement>document.getElementById('upload_file')).files[0];
    let end = false;
    
    readFile(file, function(fileData) {
        // wczytanie pliku
        let minified = "{}";
        try {
            minified = JSON.stringify(JSON.parse(fileData));
        }
        catch {
            console.error("JSON is invalid.");
            return;
        }

        // zdobycie nazwy konfiguracji
        let name_to_send = (<HTMLInputElement>document.getElementById('input_name')).value;
        
        // sprawdzenie, czy nazwa jest unikalna
        fetch("/getNameExisists/" + name_to_send)
        .then(function(response) { return response.json(); })
        .then(function(myJson) {
            let dataStructure2 = myJson;
            let jsonString = JSON.stringify(dataStructure2);
            let e = JSON.parse(jsonString);

            if (e.result > 0) {
                alert("Dana nazwa już istnieje, wybierz inną nazwę.");
                end = true;
            }
        })
        // przeslanie pliku do serwera
        .then(function() {
            if (!end) {
                if (!checkIfValidData(JSON.stringify(fileData))) {
                    alert("Przesłany plik zawiera niepoprawne dane.");
                    end = true;
                }
            }

            if (!end) {
                let dataToSend = {
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
        // wypisanie komunikatu pomyślnego przesłania pliku do serwera
        .then(function() {
            if (!end)
                alert("Twoja konfiguracja została dodana do bazy :)");
        });
    });
});
}


window.onload = () => {
    let e;

    fetch("/getStartNames")
    .then(function(response) { return response.json(); })
    .then(function(myJson) {
        let dataStructure2 = myJson;
        let jsonString = JSON.stringify(dataStructure2);
        e = JSON.parse(jsonString);
    })
    .then(function() {
        let start = document.getElementById('start_id');
        for (let i = 0; i < e.length; i++) {
            let element = document.createElement("a");
            element.setAttribute("href", "#popup_info");

            let title = document.createElement("h1");
            title.setAttribute("id", "link");
            title.setAttribute("class", "clickable");
            title.textContent = e[i].name;
            title.setAttribute("onclick", "showPopupInfo(\"" + e[i].name + "\")");

            element.appendChild(title);
            start.appendChild(element);
        }
    });
}