

class Model {
  // Algorithm Code
  /*
  info = await.getStationInfo()
  problem = (const) => {
  distance = info.distance;
  freeBikes = info.freeBikes;
  capacity = info.capacity;
};
  cspSolver = (constraints) => {
    // Enforces variables consistency by removing inconsistent values
    // from every constraint's tail node. This modifies the given variables
    var variables = await getStationInfo();
    const constrain = (variables, key, value) => {
      const cloneVar = ([id, domain]) => [variables.id, domain.slice()];
      const localVars = new Map(_(variables).map(cloneVar));
      localVars.set(key, [value]);
      const queue = constraints.slice();
      while (queue.length) {
        const [head, tail, constraint] = queue.shift();
        const [hv, tv] = [localVars.get(head), localVars.get(tail)];
        const validValues = tv.filter((t) => hv.some((h) => constraint(h, t)));
        if (validValues.length < tv.length) {
          localVars.set(tail, validValues);
          // If values from the tail have been removed,
          // incoming constraints to the tail must be rechecked.
          for (const constraint of constraints)
            if (constraint.from == tail) queue.push(constraint);
        }
      }
      return localVars;
    };
  
    const solve = function* (variables) {
      yield variables;
  
      // Choose next variable to be resolved (Minimum Remaining Values heuristic):
      // Picking the variable with the fewest values remaining in its domain
      // helps identify domain failures earlier.
      let [bestKey, min] = [null, Number.POSITIVE_INFINITY];
      for (const [key, { length }] of variables)
        if (length < min && length > 1) (bestKey = key), (min = length);
  
      // If no variable needs to be resolved, problem is solved
      if (bestKey == null) return;
  
      // Reorder values for this key (Least Constraining Values heuristic):
      // Perform arc consistency on each possible value,
      // and order values according to how many values were eliminated
      // from all the domains (fewest eliminated in the front).
      // This helps makes success more likely by keeping future options open.
      const domain = variables.get(bestKey);
      const sum = (sum, { length }) => sum + length;
      const val2vars = (val) => constrain(variables, bestKey, val);
      const val2sum = (val) => _(val2vars(val).values()).reduce(sum, 0);
      const lut = new Map(domain.map((val) => [val, val2sum(val)]));
      domain.sort((a, b) => lut.get(b) - lut.get(a));
  
      // for each of these values:
      for (const value of domain) {
        // create local state of variables,
        // assign value to variable previously chosen,
        // and propagate constraints
        const localVars = constrain(variables, bestKey, value);
        // if one domain is empty, discard value
        if (_(localVars).find(([, { length }]) => !length)) continue;
        // recursively solve narrowed problem
        let final;
        for (const value of solve(localVars)) yield (final = value);
        // if recursive solving found a solution, return
        if (final) return;
      }
  
      // No solution has been found, return failure
      yield;
    };
  
    return solve;
  }
  problem = (info)
  cspSolver = (problem)
  */
  // End of Algorithm.
  constructor() { }
  static stationInformationURL = 'https://gbfs.divvybikes.com/gbfs/en/station_information.json'
  static stationStatusURL = 'https://gbfs.divvybikes.com/gbfs/en/station_status.json'
  static freeBikesURL = 'https://gbfs.divvybikes.com/gbfs/en/free_bike_status.json'
  //GBFS - https://developers.google.com/micromobility/reference/gbfs-definitions
  static getStationStatus() {

    return fetch(Model.stationStatusURL).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Server response wasn\'t OK');
      }
    })
      .then(stationStatus => {
        var stations = [];
        Object.entries(stationStatus['data']['stations']).forEach(([key, value]) => {
          stations.push({
            key: key,
            value: value
          });
          //console.log(`${key}:${JSON.stringify(value)}`+ "from API")
        })
        console.log("obtained stations status from API")
        return stations

      }
      );

  }
  static getStationInfo() {

    return fetch(Model.stationInformationURL).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Server response wasn\'t OK');
      }
    })
      .then(stationInfo => {

        var stations = {};
        Object.entries(stationInfo['data']['stations']).forEach(([key, value]) => {
          stations[value.station_id] = value

          //console.log(`${value.station_id}:${JSON.stringify(value)}`)
        })
        console.log("obtained stations data from API")
        return stations

      }
      );

  }
  static getFreeBikes() {

    return fetch(this.freeBikesURL).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Server response wasn\'t OK');
      }
    })
      .then(bikeInfo => {

        var freeBikes = [];
        Object.entries(bikeInfo['data']['bikes']).forEach(([key, value]) => {
          freeBikes.push({
            key: key,
            value: value
          });

        })
        console.log("obtained bike data from API")
        return freeBikes

      }
      );

  }

  static getStationById() {
    return initSqlJs().then(function (SQL) {
      var db = new SQL.Database(Model.toBinArray(localStorage.getItem("vandata")));
      //try{
      var stmt = db.prepare("SELECT * FROM STATIONS");

      // }catch{
      //  return Model.getStationById(station_id)
      // }
      //stmt.bind({ $id: station_id });
      let stations = []
      let stationKeys = ['id',
        'num_bikes_disabled',
        'num_docks_available',
        'num_docks_disabled',
        'num_ebikes_available',
        'num_scooters_available',
        'num_scooters_unavailable ']
      let stationMap = {}
      let allStationMap = {}
      while (stmt.step()) {
        stations.push(stmt.get())
      }
      //write to stations if no

      stmt.free();

      stations.forEach(function (value) {
        value.forEach(function (valueIn, i) {
          stationMap[stationKeys[i]] = valueIn
        })
        allStationMap[stationMap.id] = stationMap
      });
      console.log("get all station info from database")
      return allStationMap
    })

  }
  // the map on maps page
  static getMergedGeoStations(updateSource, worker = false) { //https://gist.github.com/dschep/c987bead83b9c0513c32344d38e4fdf4
    return Promise.all([fetch(this.stationInformationURL, { cors: true }),
    fetch(this.stationStatusURL, { cors: true })])
      .then(resps => Promise.all(resps.map(resp => resp.json())))
      .then(([info, stat]) => [
        jmespath.search(info, '{type: `FeatureCollection`, features: data.stations[*].{id: station_id, geometry: {type: `Point`, coordinates: [lon, lat]}, properties: @}}'),
        jmespath.search(stat, '{type: `FeatureCollection`, features: data.stations[*].{id: station_id, properties: @}}')])
      .then(async ([infoGeoJSON, statGeoJSON]) => {
        const statMap = new Map(statGeoJSON.features.map(({ id, properties }) => [id, properties]));
        if (worker) {
          return [statMap, infoGeoJSON];
        }

        const stations = await Model.getStationsDB()
        if (stations !== undefined) {
          infoGeoJSON.features = infoGeoJSON.features.map(({ id, geometry, properties }) => (

            {
              id,
              geometry,
              properties: Object.assign({},

                {
                  description: `<strong>${properties.name}</strong>
       <p>
       <ul>
       <li>Number of bikes available&emsp;${stations[id] ? stations[id].num_bikes_available : 0} </li>
       </p>
       <li>Number of bikes disabled&emsp;${stations[id] ? stations[id].num_bikes_disabled : 0}</li>
       <li>Number of docks available&emsp;${stations[id] ? stations[id].num_docks_available : 0}</li>
       <li>Number of docks disabled&emsp;${stations[id] ? stations[id].num_docks_disabled : 0}</li>
       <li>Number of ebikes available&emsp;${stations[id] ? stations[id].num_ebikes_available : 0}</li>
        <li> Number of scooters available&emsp;${stations[id] ? stations[id].num_scooters_available : 0}</li>
        <li>Number of scooters unavailable&emsp;${stations[id] ? stations[id].num_scooters_unavailable : 0}</li>
       </ul>
       
       </p>`

                }, properties, statMap.get(id)),
            }));
        }

        return infoGeoJSON;

      }).catch((err) => {
        // If the updateSource interval is defined, clear the interval to stop updating the source.
        if (updateSource) clearInterval(updateSource);
        throw new Error(err);
      });
  }



  static convertToGEOJSON(stations) {


    var features = []

    for (const element of stations.values()) { //values not entries
      // avoid first entry
      // if idx:
      //   console.log(element)
      features.push({
        'type': 'Feature',
        'properties': { 'icon': 'bicycle-share' }/*element['value']*/,
        'geometry': {
          'type': 'Point',
          'coordinates': [element['value']['lon'],
          element['value']['lat']]
        }
      })
    }
    var result = { 'type': 'FeatureCollection', 'features': features }
    //console.log(result)
    return result

    // gj = open('divvybikestations.geojson', 'w')
    // newdata = json.dumps(result, indent=4)
    // gj.write(newdata)
    // gj.close()

  }
  //  var stationsStatus = await getStationStatus();
  //  console.log(stationsStatus[99].value.is_renting)
  //  var stationsInfo = await getStationInfo();
  //  stationsInfo.forEach(function(station) {
  //  console.log(station.key + ": " + JSON.stringify(station.value) + "<br>");
  // })
  //const json = '{"bike_id"}';
  //const obj = JSON.parse(json);
  //print(obj);
  //.then(()=>console.log(user));

  //console.log(user)
  //use json.parse

  //highlight the next station - https://docs.mapbox.com/help/tutorials/analysis-with-turf/ in map

  //helper function for database
  // not properly tested and do not have proper variable names because database is not set up
  // will most likely not beable to handle errors like what to do with empty table.
  // find if driverID exist in database
  static findDriver(Driver_id) {
    //
    // db setup needs to be done here or before hand
    //

    return initSqlJs().then(function (SQL) {
      var db = new SQL.Database(Model.toBinArray(localStorage.getItem("vandata")));
      try {
        var stmt = db.prepare("SELECT id FROM VANS WHERE id = $id");
      } catch {

      }
      console.log("try to obtain Drivers_id from API")
      stmt?.bind({ $id: Driver_id });
      if (stmt?.step() == true) {
        var row = stmt?.getAsObject();
        //can also try var row = stmt.get() and print to console without JSON.stringify(row) ;
        console.log("Driver exist: " + JSON.stringify(row));
        return true
      } else {
        console.log("Driver doesn't exist: ");

      }
      stmt?.free();
      
      return false
    })
  }

  // get bikes from data base for given driver
  static getBikesfromDb(driver_id) {
    return initSqlJs().then(function (SQL) {
      var db = new SQL.Database(Model.toBinArray(localStorage.getItem("vandata")));
      try {
        var stmt = db.prepare("SELECT bikeid,type FROM BIKES WHERE VANID = $id");
      } catch {
        return Model.getBikesfromDb(driver_id)
      }
      stmt.bind({ $id: driver_id });
      let bikes = []
      while (stmt.step()) {
        bikes.push(stmt.get())
      }
      stmt.free();
      return bikes
    })
  }

  // get bikes from data base for given driver
  static getNumberBikesfromDb(driver_id) {
    return initSqlJs().then(function (SQL) {
      var db = new SQL.Database(Model.toBinArray(localStorage.getItem("vandata")));
      try {
        var stmt = db.prepare("SELECT Count(*) FROM BIKES WHERE VANID = $id");
        console.log("Database sucessfully accessed")
      } catch {
        console.log("Database accesse failed")
        return Model.getBikesfromDb(driver_id)
      }
      stmt.bind({ $id: driver_id });
      let bikes = [];
      while (stmt.step()) {
        bikes.push(stmt.get());
      }
      stmt.free();
      return bikes[0];
    })

  }
  static executeQuery(query, paramDict = {}) {
    return initSqlJs().then(function (SQL) {
      var db = new SQL.Database(Model.toBinArray(localStorage.getItem("vandata")));

      // try{
      var stmt = db.prepare(query);
      // }catch{
      //  return Model.getBikesfromDb(driver_id)
      // }
      stmt.bind(paramDict);
      let rows = [];
      while (stmt.step()) {
        rows.push(stmt.get());
      }
      stmt.free();
      return rows;
    })
  }

  static getStationsDB() {
    return initSqlJs().then(function (SQL) {
      var db = new SQL.Database(Model.toBinArray(localStorage.getItem("vandata")));
      //try{
      var stmt = db.prepare("SELECT * FROM STATIONS");

      // }catch{
      //  return Model.getStationById(station_id)
      // }
      //stmt.bind({ $id: station_id });
      let stations = []
      let stationKeys = ['id', 'num_bikes_available',
        'num_bikes_disabled',
        'num_docks_available',
        'num_docks_disabled',
        'num_ebikes_available',
        'num_scooters_available',
        'num_scooters_unavailable ']
      let stationMap = {}
      let allStationMap = {}
      while (stmt.step()) {
        stations.push(stmt.get())
      }
      //write to stations if no

      stmt.free();
      stations.forEach(function (value) {
        value.forEach(function (valueIn, i) {
          stationMap[stationKeys[i]] = valueIn
        })
        allStationMap[stationMap.id] = stationMap
        stationMap = {};
      });
      return allStationMap
    })

  }
  static getWorkerURL(url, mime = "text/javascript") {
    const content = `importScripts( "${url}" );`;
    return URL.createObjectURL(new Blob([content], { type: mime }));
  }
  static toBinString(arr) {
    var uarr = new Uint8Array(arr);
    var strings = [], chunksize = 0xffff;
    // There is a maximum stack size. We cannot call String.fromCharCode with as many arguments as we want
    for (var i = 0; i * chunksize < uarr.length; i++) {
      strings.push(String.fromCharCode.apply(null, uarr.subarray(i * chunksize, (i + 1) * chunksize)));
    }
    return strings.join('');
  }
  static toBinArray(str) {
    var l = str.length,
      arr = new Uint8Array(l);
    for (var i = 0; i < l; i++) arr[i] = str.charCodeAt(i);
    return arr;
  }

  static initializeDb() {
    // Start the worker in which sql.js will run
    // The script there simply posts back an "Hello" message


    // Returns a blob:// URL which points
    // to a javascript file which will call
    // importScripts with the given URL
    let worker_sql = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/worker.sql-asm.js";
    const worker_url = Model.getWorkerURL(worker_sql);
    var worker = new Worker(worker_url);
    URL.revokeObjectURL(worker_url, { type: "module" });
    function error(e) {
      toc("ERROR " + e.message)
    }
    worker.onerror = error;

    let buff = null
    if (!!localStorage.getItem("vandata")) {
      buff = Model.toBinArray(localStorage.getItem("vandata"))
    }
    worker.onmessage = async function (event) {
      var results = event.data;

      tic();
      toc("Loading or creating database from file");

      execute("DROP TABLE IF EXISTS VANS; CREATE TABLE VANS (id INTEGER PRIMARY KEY, name TEXT);\
 DROP TABLE IF EXISTS BIKES; CREATE TABLE BIKES (vanid INTEGER ,bikeid INTEGER,lat REAL, lon REAL,  type TEXT,FOREIGN KEY(vanid) References VANS(id));\
 DROP TABLE IF EXISTS STATIONS; CREATE TABLE STATIONS (stationid TEXT PRIMARY KEY, bikes_available INTEGER,bikes_disabled INTEGER, docks_available INTEGER, docks_disabled INTEGER, ebikes_available INTEGER, scooters_available INTEGER, scooters_unavailable INTEGER, lat REAL, lon REAL)")


      const numvans = 6; //set vans, van id's 0 - 5 are created.
      for (let i = 0; i < numvans; i++) {
        execute("INSERT INTO VANS (id,name) VALUES($val,	$van);", { '$val': `${i}`, '$van': `VAN${i}` });

      }
      tic();

      const [statMap, infoGeoJSON] = await Model.getMergedGeoStations(0, true);
      const stationsList = await Model.getStationInfo();
      infoGeoJSON.features.map(({ id, geometry, properties }) => {
        execute("INSERT INTO STATIONS (stationid,bikes_available,bikes_disabled,docks_available,docks_disabled,ebikes_available,scooters_available,scooters_unavailable,lat,lon) \
       VALUES($val,$val2,$val3,$val4,$val5,$val6,$val7,$val8,$val9,$val10);",
          {
            '$val': id,
            '$val2': statMap.get(id).num_bikes_available,
            '$val3': statMap.get(id).num_bikes_disabled,
            '$val4': statMap.get(id).num_docks_available,
            '$val5': statMap.get(id).num_docks_disabled,
            '$val6': statMap.get(id).num_ebikes_available,
            '$val7': statMap.get(id).num_scooters_available,
            '$val8': statMap.get(id).num_scooters_unavailable,
            '$val9': stationsList[id].lat,
            '$val10': stationsList[id].lon

          }
        )
      })



      tic();
      let freeBikes = await Model.getFreeBikes();
      const numsPerGroup = Math.ceil(freeBikes.length / numvans);
      // Create array based on number of groups
      const result = new Array(numvans)
        // Make sure each element isn't empty
        .fill('')
        // For each group, grab the right `slice` of the input array
        .map((_, i) => freeBikes.slice(i * numsPerGroup, (i + 1) * numsPerGroup));
      for (let i = 0; i < result.length; i++) {
        for (const value of result[i].values()) {
          execute("INSERT INTO BIKES (vanid,bikeid ,lat , lon ,  type )\
   VALUES($vanid,	$bikeid,$lat,$lon, $type);",
            {
              '$vanid': i + 1, '$bikeid': value.value.bike_id, '$lat': value.value.lat, '$lat': value.value.lat
              , '$lon': value.value.lon, '$type': value.value.type
            });

        }
      }


      tic();


      //worker.postMessage({ action: 'close'}); //closing caused an error

    };
    // Open/Create a database
    worker.postMessage({ action: 'open', id: "1"/*,buffer: buff*/ });









    // Run a command in the database
    function execute(commands, params) {
      tic();

      worker.onmessage = function (event) {
        var results = event.data.results;
        toc("Executing SQL");
        if (!results) {
          error({ message: event.data.error });
          return;
        }
        savedb()

        tic();

        //toc(results.values)
      }

      worker.postMessage({ action: 'exec', sql: commands, params: params });
      //	outputElm.textContent = "Fetching results...";
    }



    //execBtn.addEventListener("click", execEditorContents, true);

    // Performance measurement functions
    var tictime;
    if (!window.performance || !performance.now) { window.performance = { now: Date.now } }
    function tic() { tictime = performance.now() }

    function toc(msg) {
      var dt = performance.now() - tictime;
      console.log((msg || 'toc') + ": " + dt + "ms");
    }



    // Save the db to cache
    function savedb() {


      worker.onmessage = function (event) {
        //	toc("Exporting the database");
        var arraybuff = event.data.buffer;

        //var blob = new Blob([arraybuff]);

        window.localStorage.setItem("vandata", Model.toBinString(arraybuff)/*toBinString(db.export())*/);
      };
      tic();
      worker.postMessage({ id: 2, action: 'export' });
    }

  }

}

class View {
  static mapboxKey = 'pk.eyJ1IjoicGFrbSIsImEiOiJjbDhjMWhmM2kwMjM3M3ZxdXI4MXczZTdoIn0.LdeJooae1hVu8bwjqZ1C7w'
  constructor() {
    this.btn_Maps = this.getElement('#btn-Maps')
    this.btn_Next = this.getElement('#btn-Next')
    this.btn_Login = this.getElement('#btn-login')
    this.btn_Bikes = this.getElement('#btn-Bikes')
    this.btn_Back = this.getElement('#btn_Back')
    //stationName is the object used for the station list
    this.stationName = this.getElement('#stationName')
    // this.row = this.getElement('#row')

    this.map = this.getElement('#map')
    this._initLocalListeners()
    //  console.log(!!localStorage.getItem("vanid"))
    // console.log(!!sessionStorage.getItem("vanid")) 
    if (!!!sessionStorage.getItem("vanid") && !!!localStorage.getItem("vanid") && window.location.pathname != "/index.html") { //check if not logged in
      window.location.href = "./index.html"
    }
    if (!!document.getElementById("map")) {
      this.setMap()

    }
    if (!!document.getElementById("directionMap")) {
      this.setDirectionMap()

    }
    if (!!document.getElementById("btn-login")) {
      Model.initializeDb()

      setTimeout(() => {
        document.getElementById("form").style = ""
        document.getElementById("biker").style = "display:none;"
      }, 2000)

      this.setLogin();

    }
    if (window.location.pathname == "/Bikes.html") {
      Model.initializeDb();
      this.setBikes();
    }
  }
  createElement(tag, className) {
    const element = document.createElement(tag)
    if (className) element.classList.add(className)

    return element
  }
  getElement(selector) {
    const element = document.querySelector(selector)
    return element
  }



  _initLocalListeners() {
    if (this.btn_Maps) {
      this.btn_Maps.addEventListener('click', event => {
        window.location.href = "./Maps.html"
        console.log("Switched to Maps page ")
      })
    }
    if (this.btn_Next) {
      this.btn_Next.addEventListener('click', event => {
        window.location.href = "./Next.html"
        console.log("Switched to Next page ")
      })
    }
    if (this.btn_Bikes) {
      this.btn_Bikes.addEventListener('click', event => {
        window.location.href = "./Bikes.html"
        console.log("Switched to Bikes page ")

      })
    }
    if (this.btn_Back) {
      this.btn_Back.addEventListener('click', event => {
        window.location.href = "./index.html"
        console.log("Switched to index page ")
      })
    }
  }

  async setBikes() {
    var count = 0;
    const bikes = await Model.getBikesfromDb(sessionStorage.getItem("vanid") ?? localStorage.getItem("vanid"))
    var eBike = 0
    var eScooter = 0
    console.log("this is length" + bikes.length)
    // const list  = document.getElementById("list")
    // const row1 = document.createElement('li')
    // const span1 = document.createElement('span')
    // span1.classList.add("badge","bg-primary" ,"rounded-pill")
    // span1.innerText = bike[1].replace('_'," ")
    //row1.classList.add("list-group-item","d-flex", "justify-content-between", "align-items-center")
    //row1.innerHTML = `<b>Number of vehicles in van: ${bikes.length}</b>`
    //row1.appendChild(span1)
    //list.appendChild(row1)
    for (const bike of bikes) {
      //const list  = document.getElementById("list")
      //  const row = document.createElement('li')
      //  const span = document.createElement('span')
      //  span.classList.add("badge","bg-primary" ,"rounded-pill")
      //  span.innerText = bike[1]
      //  row.classList.add("list-group-item","d-flex", "justify-content-between", "align-items-center")
      //  row.innerHTML = `<b>ID ${bike[0]}</b>`

      //   row.style.color = "rgba(22, 145, 232, 0.921)"; 
      //   row.appendChild(span)
      //  list.appendChild(row)
      if (bike[1] == "electric_bike") {
        eBike++

      }
      if (bike[1] == "electric_scooter") {
        eScooter++

      }
      count++
    }
    console.log("this eScooter num: " + eScooter);
    console.log("this eBike num: " + eBike);
    console.log("this is count" + count);
    const list = document.getElementById("list")
    const p = document.createElement('p')
    const p2 = document.createElement('p')
    const p3 = document.createElement('p')
    p.innerHTML = `<b>Electric Bikes: ${eBike}</b>`
    //p.style 
    p2.innerHTML = `<b>Electric Scooters: ${eScooter}</b>`
    p3.innerHTML = `<b>Total Vechicles: ${bikes.length}</b>`
    //const row = document.createElement('li')
    //const span = document.createElement('span')
    //span.classList.add("badge","bg-primary" ,"rounded-pill")
    //span.innerText = bike[1]
    //row.classList.add("list-group-item","align-items-center")
    // row.innerHTML = `<b>Electric Bikes: ${num_ebikes_available}</b>`

    //row.style.color = "rgba(22, 145, 232, 0.921)"; 
    //row.appendChild(span)
    list.appendChild(p)
    list.appendChild(p2)
    list.appendChild(p3)

  }
  setLogin() {



    //  (function () {
    //   'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    // Array.prototype.slice.call(forms)
    //   .forEach(function (form) {
    document.getElementById("btn-login").addEventListener('click', async function (event) {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
        form.classList.add('was-validated')

        return;
      }

      let vanIdInput = document.getElementById("van-id-txtbox").value
      if (isNaN(vanIdInput)) {
        return;
      }
      event.preventDefault()

      //  sessionStorage.clear();
      sessionStorage.setItem("vanid", vanIdInput)
      localStorage.removeItem("vanid")

      if (document.getElementById("remember-chkbox").checked) {
        //   localStorage.clear();
        localStorage.setItem("vanid", vanIdInput)
      }
      form.classList.add('was-validated')

      if (await Model.findDriver(vanIdInput)) {
        window.location.href = "./Maps.html"
        console.log(window.location.href)
      }
    }, false)
    // })
    //  })()

  }
  async setMap() {
    mapboxgl.accessToken = View.mapboxKey
    const map = new mapboxgl.Map({
      container: this.map, // container ID
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [-87.6298, 41.8781], // starting position [lng, lat]
      zoom: 10, // starting zoom
      projection: 'globe' // display the map as a 3D globe
    });

    //  var stations = await Model.getStationInfo()
    //  stations = Model.convertToGEOJSON(stations)
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: false
      },
      fitBoundsOptions: {
        zoom: 10,
      },
      trackUserLocation: true,
      showUserLocation: false,
      showAccuracyCircle: false
    });
    map.addControl(geolocate);
    map.on('style.load', () => {
      map.setFog({}); // Set the default atmosphere style
      geolocate.trigger()
    });
    geolocate.on('geolocate', async (event) => {
      let data = await Model.getMergedGeoStations()//stations
      if (map.getSource('stations')) {
        map.getSource('stations').setData(data);
      }
      else {
        map.addSource('stations', {
          // This GeoJSON contains features that include an "icon"
          // property. The value of the "icon" property corresponds
          // to an image in the Mapbox Streets style's sprite.
          'type': 'geojson',
          'data': data
        });
        // Add a layer showing the stations.
        map.addLayer({
          'id': 'stations',
          'type': 'symbol',
          'source': 'stations',
          'layout': {
            'icon-image': 'bicycle-share',//'{icon}',
            'icon-allow-overlap': false
          }
        });
      }
      // Update the source from the API every 5 seconds.
      const updateSource = setInterval(async () => {
        const geojson = await Model.getMergedGeoStations(updateSource);
        map.getSource('stations').setData(geojson);
      }, 5000);
      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'stations', (e) => {
        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        //remove previous popup 
        const popups = document.getElementsByClassName("mapboxgl-popup");

        if (popups.length) {

          popups[0].remove();

        }
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'places', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'stations', () => {
        map.getCanvas().style.cursor = '';
      });

      // Set an event listener that fires
      // when a geolocate event occurs.

      //  geolocate.on('geolocate', (event) => {
      map.flyTo({
        zoom: map.getZoom()
      });
      const searchResult = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [event.coords.longitude, event.coords.latitude]
        }
      };

      /**
      * Calculate distances:
      * For each store, use turf.disance to calculate the distance
      * in miles between the searchResult and the store. Assign the
      * calculated value to a property called `distance`.
      */
      const options = { units: 'miles' };
      for (const station of data.features) {
        station.properties.distance = turf.distance(
          searchResult.geometry,
          station.geometry,
          options
        );
      }

      /**
      * Sort stores by distance from closest to the `searchResult`
      * to furthest.
      */
      data.features.sort((a, b) => {
        if (a.properties.distance > b.properties.distance) {
          return 1;
        }
        if (a.properties.distance < b.properties.distance) {
          return -1;
        }
        return 0; // a must be equal to b
      });

      /**
      * Rebuild the listings:
      * Remove the existing listings and build the location
      * list again using the newly sorted stores.
      */
      const listings = document.getElementById('stations');
      while (listings.firstChild) {
        listings.removeChild(listings.firstChild);
      }
      buildStationList(data);

      //remove previous popups
      const popups = document.getElementsByClassName("mapboxgl-popup");

      if (popups.length) {

        popups[0].remove();

      }
      /* Open a popup for the closest store. */
      new mapboxgl.Popup()
        .setLngLat([data.features[0].properties.lon, data.features[0].properties.lat])
        .setHTML(data.features[0].properties.description)
        .addTo(map);//creates popup

      /** Highlight the listing for the closest store. */
      // const activeListing = document.getElementById(
      // `link-${data.features[0].properties.name}`
      // );
      // activeListing.classList.add('active');




      document.querySelectorAll('.item').forEach(function (i) {

        //have 1 list item be active
        i.addEventListener('click', function (e) {
          var activeItemArray = document.querySelectorAll('.item.active');
          i.classList.toggle('active');
          activeItemArray.forEach(el => {
            el.classList.toggle('active');
          });
          /*const clickedBtnIndex = [...itemArray]*/
          //expandArray[clickedBtnIndex].classList.toggle("hidden");

        })
      });
      /**
      * Adjust the map camera:
      * Get a bbox that contains both the geocoder result and
      * the closest store. Fit the bounds to that bbox.
      */
      // const bbox = getBbox(data, 0, searchResult);
      // map.fitBounds(bbox, {
      // padding: 100
      // });


      // function getBbox(sortedStores, storeIdentifier, searchResult) {
      //   const lats = [
      //     sortedStores.features[storeIdentifier].geometry.coordinates[1],
      //     searchResult.coordinates[1]
      //   ];
      //   const lons = [
      //     sortedStores.features[storeIdentifier].geometry.coordinates[0],
      //     searchResult.coordinates[0]
      //   ];
      //   const sortedLons = lons.sort((a, b) => {
      //     if (a > b) {
      //       return 1;
      //     }
      //     if (a.distance < b.distance) {
      //       return -1;
      //     }
      //     return 0;
      //   });
      //   const sortedLats = lats.sort((a, b) => {
      //     if (a > b) {
      //       return 1;
      //     }
      //     if (a.distance < b.distance) {
      //       return -1;
      //     }
      //     return 0;
      //   });
      //   return [
      //     [sortedLons[0], sortedLats[0]],
      //     [sortedLons[1], sortedLats[1]]
      //   ];
      // }




      //   });
      geolocate.trigger()

    });



    function buildStationList(stations) {
      for (const station of stations.features) {
        /* Add a new station section to the sidebar. */
        const stationsEl = document.getElementById('stations');
        const stationChild = stationsEl.appendChild(document.createElement('div'));
        /* Assign a unique `id` to the station. */

        stationChild.id = `station-${station.id}`;
        /* Assign the `item` class to each station for styling. */
        stationChild.className = 'item';

        /* Add the link to the individual station created above. */
        const link = stationChild.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.id = `link-${station.properties.name}`;
        link.innerHTML = `${station.properties.name}`;

        /* Add details to the individual station. */
        if (typeof station.properties.address !== 'undefined') {
          const details = stationChild.appendChild(document.createElement('div'));
          details.innerHTML = `${station.properties.address}`;
        }
        // if (station.properties.phone) {
        //   details.innerHTML += ` · ${station.properties.phoneFormatted}`;
        // }
        // if (station.properties.distance) {
        //   const roundedDistance = Math.round(station.properties.distance * 100) / 100;
        //   details.innerHTML += `<div><strong>${roundedDistance} miles away</strong></div>`;
        // }
        link.addEventListener('click', function () {
          for (const feature of stations.features) {
            if (this.id === `link-${feature.properties.name}`) {
              flyToStore(feature);
              //remove mapbox popup
              const popups = document.getElementsByClassName("mapboxgl-popup");

              if (popups.length) {

                popups[0].remove();

              }
              new mapboxgl.Popup()
                .setLngLat([feature.properties.lon, feature.properties.lat])
                .setHTML(feature.properties.description)
                .addTo(map);//creates popup
              //  createPopUp(feature);
            }
          }
          const activeItem = document.getElementsByClassName('active');
          if (activeItem[0]) {
            activeItem[0].classList.remove('active');
          }
          this.parentNode.classList.add('active');
        });
      }
    }
    function flyToStore(currentFeature) {
      map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 15
      });
    }

  }


  async setDirectionMap() {

    mapboxgl.accessToken = View.mapboxKey
    const map = new mapboxgl.Map({
      container: 'directionMap',
      // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-87.6298, 41.8781],
      zoom: 13
    });
    // var directions =  new MapboxDirections({
    //             accessToken: mapboxgl.accessToken,
    //             unit: 'imperial',
    //            profile: 'mapbox/driving-traffic',
    //            interactive: false,

    //            controls: {
    //             inputs: false,
    //             instructions: false,
    //             profileSwitcher: false

    //            }

    //         })
    // map.addControl(directions,'top-left');
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    // Add the control to the map.
    map.addControl(geolocate);
    map.on('style.load', () => {
      const audio = new Audio('https://dl.dropboxusercontent.com/s/h8pvqqol3ovyle8/tom.mp3');
      audio.muted = true;

      const alert_elem = document.querySelector('.alert,.alert-hidden');

      audio.play().then(() => {
        // already allowed
        alert_elem.remove();
        resetAudio();
        geolocate.trigger();
      })
        .catch(() => {
          // need user interaction
          alert_elem.classList.remove("alert-hidden");
          alert_elem.classList.add("alert");
          alert_elem.addEventListener('click', ({ target }) => {
            if (target.matches('button')) {
              const allowed = target.value === "1";
              if (allowed) {
                geolocate.trigger();

                alert_elem.remove();

                /*         const voiceEvent = new Event('voice');
                   const inst = document.querySelector('#instructions');
                
                 inst.dispatchEvent(voiceEvent);*/
              }

            }
          });
        });



      function resetAudio() {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = true;
        console.log("audio muted ")
      }
    });
    // Set an event listener that fires
    // when a trackuserlocationstart event occurs.
    var startCoord = []
    var endCoord = []
    geolocate.on('geolocate', async (data) => {

      // directions.setOrigin([data.coords.longitude, data.coords.latitude])
      // Add starting point to the map
      startCoord = await data.coords

      endCoord = await theEnd();
      let geoLoco = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: await data.coords
            }
          }
        ]
      }
      if (map.getSource('point')) {
        map.getSource('point').setData(geoLoco);
      }
      else {
        map.addLayer({
          id: 'point',
          type: 'circle',
          source: {
            type: 'geojson',
            data: geoLoco
          },
          paint: {
            'circle-radius': 10,
            'circle-color': '#3887be'
          }
        })
      }
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${await startCoord.longitude},${await startCoord.latitude};${endCoord[0]},${endCoord[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: 'GET' }
      ).then((response) => {
        if (response.ok) {
          return response;
        }

      }).catch((error) => console.error(error));
      const json = await query.json();
      const dataRoute = json.routes[0];
      const route = dataRoute.geometry.coordinates;
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };

      // if the route already exists on the map, we'll reset it using setData
      if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
      }
      // otherwise, we'll make a new request
      else {
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }


      // Create a 'LngLatBounds' with both corners at the first coordinate.
      const bounds = new mapboxgl.LngLatBounds(
        route[0],
        route[1]
      );

      // Extend the 'LngLatBounds' to include every coordinate in the bounds result.
      for (const coord of route) {
        bounds.extend(coord);
      }

      map.fitBounds(bounds, {
        padding: 20
      });
      // get the sidebar and add the instructions
      const instructions = document.getElementById('instructions');
      const steps = dataRoute.legs[0].steps;

      let tripInstructions = '';
      for (const step of steps) {
        tripInstructions += `<li>${step.maneuver.instruction}</li>`;
      }
      let sqlquery = "Select * from STATIONS where stationid = $station_id"
      let params = { $station_id: endCoord[2] }
      let rows = await Model.executeQuery(sqlquery, params)
      let threethreeAlloc = Math.floor(1 / 3 * rows[0][3])


      //dummy output none of the vans in db have nonelectric bicycles
      instructions.innerHTML = `<p><strong>Bikes: ${rows[0][1] - threethreeAlloc
        } Ebikes: ${rows[0][5] - threethreeAlloc
        } Scooters: ${rows[0][6] - threethreeAlloc
        }</strong></p>
      <p><strong>Trip duration: ${Math.floor(
          dataRoute.duration / 60
        )} min 🚐 </strong></p><ol>${tripInstructions}</ol>`;
      instructions.style.display = "block"

      this.voiceCommand()


    });
    async function theEnd() {
      //directions.setDestination([-87.677409, 41.901315])
      let query = "SELECT lon, lat, SQRT(\
        power(69.1 * (lat - $startlat), 2) +\
        power(69.1 * ($startlng - lon) * COS(lat / 57.3), 2)) AS distance,stationid\
    FROM Stations ORDER BY distance limit 1;"

      let params = { $startlat: startCoord.latitude, $startlng: startCoord.longitude }
      let rows = await Model.executeQuery(query, params)
      console.log(rows)
      endCoord = [rows[0][0], rows[0][1]]
      const end = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: endCoord
            }
          }
        ]
      };
      if (map.getLayer('end')) {
        map.getSource('end').setData(end);
      } else {
        map.addLayer({
          id: 'end',
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: endCoord
                  }
                }
              ]
            }
          },
          paint: {
            'circle-radius': 10,
            'circle-color': '#f30'
          }
        });
      }
      endCoord.push(rows[0][3])
      return endCoord
    }
    // geolocate.on('trackuserlocationstart', () => {

    //   theEnd()

    // })
  }

  voiceCommand() {
    // import easySpeech from 'https://cdn.skypack.dev/easy-speech';
    const event = new Event('voice');
    const elem = document.querySelector("#instructions");
    elem.dispatchEvent(event);

  }


}


class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
  }
}

const app = new Controller(new Model(), new View())
