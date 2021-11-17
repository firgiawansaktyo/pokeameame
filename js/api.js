var base_url = "https://pokeapi.co/api/v2/";

function status(response) {
    if (response.status !== 200) {
        console.log("Error : " + response.status);

        return Promise.reject(new Error(response.statusText));
    } else {
        return Promise.resolve(response);
    }
}

function json(response) {
    return response.json();
}

function error(error) {
    console.log("Error : " + error);
}

function fetchStatusOnline(){
    window.addEventListener('load', function() {
        var status = document.getElementById("status");
        function updateOnlineStatus(event) {
            var condition = navigator.onLine ? "online" : "offline";
            status.className = condition;
            status.innerHTML = condition.toUpperCase();
        }
        window.addEventListener('online',  updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    });

}

function fetchAllPokemon(){
    const API_URL = base_url + "pokemon?" + `limit=6` ;
    fetch(API_URL)
        .then(response => response.json())
        .then(function(allpokemon){
            allpokemon.results.forEach(function(pokemon){
                getAllPokemon(pokemon);
            })
        })
}

function getAllPokemon(pokemon) {
    let url = pokemon.url

    if ('caches' in window) {
        caches.match(url)
            .then(function (response) {
                if (response) {
                    response.json()
                        .then(function(pokeData){
                            renderPokemon(pokeData)
                        }).catch(error);
                }
            })
    } else {
        event.respondWith(
            caches.match(event.request, {ignoreSearch: true})
                .then(function (response) {
                    return response || fetch(event.request);
                })
        )
    }

    fetch(url)
        .then(status)
        .then(response => response.json())
        .then(function(pokeData){
            renderPokemon(pokeData)
        }).catch(error);
}

function renderPokemon(pokeData){
    let allPokemonContainer = document.getElementById('poke-container');
    let pokeContainer = document.createElement("div")
    pokeContainer.classList.add('ui', 'card');

    let pokeImgContainer = document.createElement('div')
    pokeImgContainer.classList.add('image')

    let pokeImage = document.createElement('img')
    pokeImage.srcset = pokeData.sprites.front_default

    var pokeName = document.createElement('a');
    var title = pokeData.name
    var linkText = document.createTextNode(title);
    pokeName.appendChild(linkText);
    pokeName.href = "detailPokemon.html?name=" + title;

    let pokeTypes = document.createElement('ul')

    createTypes(pokeData.types, pokeTypes)

    pokeContainer.append(pokeImage, pokeName, pokeTypes);
    allPokemonContainer.appendChild(pokeContainer);
}

function fetchMorePokemon(offset){
    const API_URL = base_url + "pokemon?" + `limit=6` + "&" + `offset=${offset}` ;
    fetch(API_URL)
        .then(response => response.json())
        .then(function(allpokemon){
            allpokemon.results.forEach(function(pokemon){
                getAllPokemon(pokemon);
            })
        })
}

function createTypes(types, ul){
    types.forEach(function(type){
        let typeSpan = document.createElement('li');
        typeSpan.innerText = type['type']['name'];
        ul.append(typeSpan)
    })
}

function getDetailPokemonByName() {
    var urlParams = new URLSearchParams(window.location.search);
    var nameParam = urlParams.get("name");

    fetch(base_url + "pokemon/" + nameParam)
        .then(status)
        .then(json)
        .then(function (data) {

            var i, statusName = "", statusPoint="";
            for (i in data.stats) {
                statusName += data.stats[i].stat.name + "<br>";
                statusPoint += data.stats[i].base_stat + "<br>";
            }

            var j, typeName = "";
            for (j in data.types) {
                typeName += "<span style='background-color: #007bff; color:white; border-radius:3px; padding: 5px'>"+ data.types[j].type.name + "</span>" + '&nbsp;';
            }

            var detailPokemonHTML = `
                <div class="row">
                      <div class="card">
                        <div class="card-image center-align">
                          <img src="${data.sprites.front_default}" style="width: 200px; height: 200px; top:30px">
                          <h4 style="color: black; text-align: center;">${data.name}</h4>
                          <p>${typeName}</>
                        </div>
                        <div class="card-content">
                               <table>
                                <thead>
                                  <tr>
                                      <th>Status</th>
                                      <th>Point</th>
                                  </tr>
                                </thead>
                        
                                <tbody>
                                  <tr>
                                    <td>${statusName}</td>
                                    <td>${statusPoint}</td>
                                  </tr>
                                </tbody>
                              </table> 
                          </div>
                      </div>
                    </div>
                </div>
            `;
            document.getElementById("body-content").innerHTML = detailPokemonHTML;
        })
        .catch(error);
}


