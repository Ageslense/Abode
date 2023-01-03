// API Functions
function easyHTTP(){
    this.http = new XMLHttpRequest;
}

let properties = "https://mos.jurny.com/api/guest/properties?"

easyHTTP.prototype.get = function(url, callback){
      
   this.http.open("GET", url);
   
   this.http.setRequestHeader("Content-Type", "application/json");
   
   let self = this
   this.http.onload = function() {
      if(self.http.status === 200){
         callback(JSON.parse(self.http.responseText));
      }
   }

   this.http.send();
}

const xhr = new easyHTTP

const UIproperties = document.getElementById('properties')
const city = document.querySelector('.new-hero-title').textContent
let UIpet = document.querySelector('#pet')

let check_in 
let check_out 

let pets;

// Calendar Function
const units = document.querySelectorAll('.unit')

let criteria = ''

if(window.sessionStorage.getItem('search') != null){

    const search = JSON.parse(sessionStorage.getItem('search'));

    let UIcheckin = document.querySelector('#checkin')
    let UIadult = document.querySelector('#guest-adult')
    let UIkids = document.querySelector('#guest-kid')

    if( search.check_in != "" ){
        UIcheckin.value = `${search.check_in}/${search.check_out}`
    }
    if( search.adults != undefined ){
        UIadult.value = search.adults
        console.log(search.adults);
    }
    if( search.kids != undefined ){
        UIkids.value = search.kids 
    }
    if( search.pet == true ){
        UIpet.checked = true

        UIpet.parentElement.querySelector('.w-checkbox-input').classList.add('w--redirected-checked')
    }

    searcher()
} 

//Search Function
document.getElementById('search-btn').addEventListener('click', () => {
    searcher()
})

document.getElementById('pet').addEventListener('change', () => {
    if(document.getElementById('pet').checked == true){
        pets = true
    } else{
        pets = undefined
    }
})

document.querySelectorAll('.unit').forEach( e => {
    e.addEventListener('click', () => {
        e.querySelector('.unit-link-cover').click()
    })
})

function dateDiffInDays(a, b) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

async function populator(data){
  
    console.log(data);
    let properties = []
    const UIPropContainer = document.querySelector('.grid-3.col-wrapper')

    let UIcheckin = document.getElementById('checkin')
    let dates = UIcheckin.value.split("/")

    // dates.forEach( e => {
    //     let arr = e.split('-')

    //     arr.splice(2, 0, arr.splice(0, 1)[0])
    // })

    const a = new Date(dates[0]),
        b = new Date(dates[1]);

    difference = dateDiffInDays(a, b);
      
    // Get the units from ALL buildings
    data.forEach( e => {
        e.unitTypes.forEach( a => properties.push(a))
    })

    UIPropContainer.innerHTML = ''

    if(properties.length != 0){

      properties.forEach( e => {
          let amenitiesHtml = ''
          let pets = ''
  
          e.amenities.forEach( (a, i)=> {
            if(i < 12){

                amenitiesHtml += `<div role="listitem" class="unit__listing-am-item w-dyn-item"><div>${a.title}</div></div>`
            }
          })
  
          if(e.features.suitablePets){
              pets = '<p class="pet-friendliness">Pet Friendly</p>'
          }
  
          UIPropContainer.innerHTML += `<div class="col-33 unit"><div class="img-container" style="background-image:url(${e.mainImage.image.urls.medium})"  ><div class="unit__image"></div></div><div class="unit__info-wrap"><h3 class="unit__title">${e.name}</h3><p>${e.description}</p><h4 class="test-heading1">Amenities include:</h4><div class="unit__amenities-wrap">
          <div class="w-dyn-list">
            <div role="list" class="unit__listing-am-list w-dyn-items">${amenitiesHtml}
          </div>
        </div></div><div class="col-wrapper"><div class="col-50"><div class="button"><div>Book now</div></div></div><div class="col-50"><div class="city-page__unit-price-wrap"><div class="city-unit-price-text">from $</div><div class="city-unit-price">${(Number(e.price)/difference).toFixed(2)}</div><div class="city-unit-price-text">/night</div></div></div></div><div class="id-text">${e.uid}</div><p class="pet-friendliness">"${e.features.suitablePets}"></p><a href="/unit?id=${e.uid}" class="unit-link-cover w-inline-block"></a></div>`
      })

      document.querySelector('.units__no-results').style.display = 'none'

    } else{
      document.querySelector('.units__no-results').style.display = 'block'
    }
}

function searcher(){
    const container = document.getElementById('wf-form-Search-Form')
    let UIcheckin = container.querySelector('#checkin')
    let adults = Number(container.querySelector('#guest-adult').value)
    let kids = Number(container.querySelector('#guest-kid').value)
    let guests = adults + kids

    let vals = UIcheckin.value.split('/')

    check_in = vals[0];
    check_out = vals[1];

    criteria = `availableFrom=${check_in}&availableTo=${check_out}&cityName=${city.toLowerCase()}&accommodates=${guests}`

    const item = {
        check_in: check_in,
        check_out: check_out,
        adults: adults,
        kids: kids,
        pet: UIpet.checked
    }

    window.sessionStorage.setItem('search', JSON.stringify(item))
    
    let no = Math.floor((Date.parse(check_out) - Date.parse(check_in)) / 86400000)

    if( no < 7){

        document.querySelector('.week-notification').style.display = 'block'
        document.querySelector('.units__no-results').style.display = 'none'
        document.querySelector('.loading-gif').style.display = 'none'
        document.querySelector('.grid-3').style.display = 'none'
        
    } else{
        
        document.querySelector('.week-notification').style.display = 'none'
        document.querySelector('.loading-gif').style.display = 'block'

        xhr.get(`${properties}${criteria}`, data => populator(data))

        document.querySelector('.grid-3').style.display = 'grid'
    }
}

document.getElementById('checkin').setAttribute('readonly', true);

// // Calendar function
// async function getPrice(URL){
//     var myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");

//     var requestOptions = {
//     method: 'GET',
//     headers: myHeaders,
//     redirect: 'follow'
//     };

//     const response = await fetch(URL, requestOptions)

//     const data = await response.json()

//     console.log(data);

//     return data;
// }