import maptoken from "./token.js"

let myDataFeed = [];
let map;
let links;

const initLocation = [21.011974811553955, 52.24554101223329];
const initZoom = 10;

/*
  initialize the Map
*/

function initMap() {
  console.log(MAPTOKEN);
  mapboxgl.accessToken =
      "pk.eyJ1IjoianNvYmN6YWsiLCJhIjoiY2szN2N4NmNqMGE5dTNscWVwYjh2MDN6ZSJ9.97m5-DLCT9vVq7eLCG5IqQ";
  map = new mapboxgl.Map({
      container: "mapid",
      style: "mapbox://styles/mapbox/light-v10",
      center: initLocation,
      zoom: initZoom,
  });
}

/*
  function generate POS list elements
*/

function makePOSList() {
  const lista = document.querySelector('.lista');
    myDataFeed.forEach((key,index) => {
      const pos = document.createElement('div');
      pos.classList.add("p-4", "bg-gray-100", "hover:bg-gray-200", "mb-4", "link", "cursor-pointer");
      pos.id = index;
        pos.innerHTML = `
          <h1 class="font-bold">
            ${key.name}
          </h1>
          <p>
            ${key.address}
          </p>
        `;
        lista.appendChild(pos)
    })
  makeLinks();
};

/*
  function set 'click' listeners on POS list elements
  1) set active class
  2) fly to coordinates
  3) show Popup
*/

function makeLinks() {
  links = document.querySelectorAll('.link')
  links.forEach(link => {
    link.addEventListener("click", function () {
      setActive(this.id);
      flyToStore(myDataFeed[this.id]);
      createPopUp(myDataFeed[this.id]);
    });
  })
}

/*
  function set 'active' position on POS list
  1) reset current "active class"
  2) set active to el
  3) scroll element into view
*/

function setActive(el) {
  links.forEach(link => {
    link.classList.remove('active')
  })
  if (el) {
    links[el].classList.add('active');
    links[el].scrollIntoView({
      behavior: "smooth",
    });
  }
}

/*
  function move map to POS coordinates
  if no parameter passed, map location is set to init coordinates
  and init zoom level
*/

function flyToStore(currentFeature) {
  currentFeature =
    typeof currentFeature !== "undefined"
      ? {center:currentFeature.geometry.coordinates, zoom:15}
      : {center:initLocation, zoom:initZoom};
  map.flyTo(currentFeature);
}

/*
  function generates custom markers
  and add action listeners to it
  1) fly to coordinates
  2) open poup
  3) set active item on POS list
*/

function showMarkers() {
  myDataFeed.forEach((key, index) => {
    const el = document.createElement('div');
    el.classList.add('marker');
    el.id = index;
    new mapboxgl.Marker(el,{ offset: [0, -40] })
      .setLngLat(key.geometry.coordinates)
      .addTo(map);
      el.addEventListener('click', function () {
        flyToStore(key);
        createPopUp(key);
        setActive(this.id);
      })
  })
}

/*
  function create and shows Popup
  1) if popup exist - remove it
  2) create new Popup
  3) on Popup close set map to init coordinates and init zoom
*/

function createPopUp(currentFeature) {
  const popUps = document.getElementsByClassName("mapboxgl-popup");
  if (popUps[0]) popUps[0].remove();
  if (currentFeature.photo) {
    const popup = new mapboxgl.Popup({
      closeOnClick: false,
      offset: 10,
      maxWidth: "300px",
    })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(
        `
            <img src="${currentFeature.photo.url}" />
          `
      )
      .addTo(map);
    popup.on("close", () => {
      flyToStore();
      setActive();
    });
  }
}

/*
  Starting App
  1) fetch Data
  2) initialize the Map,
  3) add Markers & generate the POS List
*/

(function loadData() {
  const ax = axios.create({
    baseURL: "https://poslocator.herokuapp.com/",
  });
  ax.get("pos")
    .then((response) => {
      myDataFeed = response.data.map((key) => {
        return {
          name: key.name,
          address: key.address,
          photo: key.photo,
          geometry: {
            coordinates: key.coordinates,
          },
        };
      });
      initMap();
      makePOSList();
      showMarkers();
    })
    .catch((error) => {
      console.log(error);
    });
})();