// API Functions
class EasyHTTP {
    // Make an HTTP GET Request
   async get(url, callback) {
     const response = await fetch(url);
 
     const resData = await response.json();
     callback(resData)
   }
 
   // HTTP Post Request
   async post(url, data, callback) {
 
       const response = await fetch(url, {
         method: 'POST',
         headers: {
           'Content-type': 'application-json'
         },
         body: JSON.stringify(data)
       });
 
       const resData = await response.json();
       callback(resData)
   }
}

let propertyURL = `https://mos.jurny.com/api/guest/properties`

const xhr = new EasyHTTP
// End of API

// Get Unit  ID
let params = new URLSearchParams(document.location.search);

const uid = params.get("id");

let UIbookLink = document.querySelector('#booking')
let UIpet = document.querySelector('#pets')

// Info Boxes
let UInoResults = document.querySelector('.noresults-box')
let UIbooking = document.querySelector('.booking-box')

// Form Fields
let UIadult = document.querySelector('#guest-adult')
let UIkid = document.querySelector('#guest-kid')
let UIcheckin = document.querySelector('#checkin')

// Global
let quote

xhr.get(`${propertyURL}/${uid}`, populatePage)

document.getElementById('search-btn').addEventListener('click', (e) => {

    e.preventDefault()
    
    searcher(uid)
})

document.querySelector('#booking-form').addEventListener('submit', book)

// Populate Page
function populatePage(data){

    const UImainImg = document.getElementById('property-img')
    const UIdescription = document.getElementById('description')
    const UIlocation = document.getElementById('address')
    const UItitle = document.getElementById('property-name')
    
    const UIgallery = document.getElementById('gallery')

    UImainImg.srcset = ''
    UImainImg.src = data.mainImage.image.urls.medium 
    
    UIdescription.textContent = data.description
    UItitle.textContent = data.building.name

    UIlocation.textContent = data.building.street + ', ' + data.building.city

    // Populate Gallery
    UIgallery.querySelectorAll('img').forEach(e => {
        e.srcset = ''
    })
    
    let html = ''

    data.images.forEach( (img, i) => {

        if( i === 0 ){
            document.querySelector('.unitpage-left').innerHTML = `<a href="#" class="w-inline-block w-lightbox" aria-label="open lightbox" aria-haspopup="dialog"><img src="${img.image.urls.medium}" loading="lazy" sizes="(max-width: 767px) 92vw, (max-width: 991px) 42vw, 41vw" alt="" class="unitpage__thumb-image large"><script type="application/json" class="w-json">{
                "items": [
                  {
                    "_id": "example_img",
                    "origFileName": "Gallery Image",
                    "fileName": "Gallery Image",
                    "fileSize": 362034,
                    "height": 2400,
                    "url": "${img.image.urls.medium}",
                    "width": 3600,
                    "type": "image"
                  }
                ],
                "group": ""
              }</script></a>`
        } else{
            html += `<a href="#" class="w-inline-block w-lightbox" aria-label="open lightbox" aria-haspopup="dialog"><img src="${img.image.urls.medium}" loading="lazy" sizes="(max-width: 767px) 28vw, 13vw" alt="" class="unitpage__thumb-image"><script type="application/json" class="w-json">{
            "items": [
                {
                "_id": "example_img",
                "origFileName": "Gallery Image",
                "fileName": "Gallery Image",
                "fileSize": 362034,
                "height": 2400,
                "url": "${img.image.urls.medium}",
                "width": 3600,
                "type": "image"
                }
            ],
            "group": ""
            }<\/script></a>`
        }
    })

    UIgallery.querySelector('.unitpage-wrap').innerHTML = html

    checkPrevSearch()
}

//Search Function
function searcher(uid){
    console.log(1);
    const container = document.getElementById('wf-form-Search-Form')

    let a = 0

    container.querySelectorAll('input').forEach( e => {
        if( !e.parentElement.classList.contains('booking-form')){

            if( e.value == '' && a == 0){
                alert('Please fill all the required fields')
                a = 1
            }
        }
    })

    let vals = UIcheckin.value.split('/')

    let check_in = vals[0];
    let check_out = vals[1];

    criteria = {
        "adults": UIadult.value,
        "children": UIkid.value,
        "withPets": UIpet.value,
        "fromDate": check_in,
        "toDate": check_out
    }

    // ADD 7 DAY CHECKER
    let no = Math.floor((Date.parse(check_out) - Date.parse(check_in)) / 86400000)

    if( no < 7 ){

        document.querySelector('.week-notification').classList.add('active')
        UInoResults.classList.remove('active')
        UIbooking.classList.remove('active')
    } else{

        xhr.get(`${propertyURL}/${uid}/availability?fromDate=${check_in}&toDate=${check_out}`, availabilityUpdate)
    }
}

// Previous Search Checker
function checkPrevSearch(){
    if(window.sessionStorage.getItem('search') != null){

        const search = JSON.parse(sessionStorage.getItem('search'));
    
        let UIcheckin = document.querySelector('#checkin')
    
        if( search.check_in != "" ){
            UIcheckin.value = `${search.check_in}/${search.check_out}`
        }
        if( search.adults != undefined ){
            UIadult.value = search.adults
        }
        if( search.kids != undefined ){
            UIkid.value = search.kids 
        }
        if( search.pet == true ){
            UIpet.checked = true
    
            UIpet.parentElement.querySelector('.w-checkbox-input').classList.add('w--redirected-checked')
        }
    
        searcher(uid)
    } 
}

// Availability
function availabilityUpdate(data){

    let a = true

    const arr = Object.values(data)

    arr.forEach( e => {
        if( e.availability == 0){
            a = false
        }
    })

    console.log(arr, a);

    if(a && arr.length != 0){

        let vals = UIcheckin.value.split('/')

        let check_in = vals[0];
        let check_out = vals[1];

        xhr.post(`${propertyURL}/${uid}/quote`,{
            "adults": UIadult.value,
            "children": UIkid.value,
            "withPets": UIpet.checked,
            "fromDate": check_in,
            "toDate": check_out
        }, getQuote)

    } else{
        // document.getElementById('weekly-discount').classList.add('hidden')
        // document.getElementById('monthly-discount').classList.add('hidden')
        UIbooking.classList.remove('active')

        document.querySelector('.week-notification').classList.remove('active')
        UInoResults.classList.add('active')        
    }
    
}

// Book
function book(){
    
    let vals = UIcheckin.value.split('/')

    let check_in = vals[0];
    let check_out = vals[1];

    xhr.post(`${propertyURL}/${uid}/book`,{
        "adults": Number(UIadult.value),
        "children": Number(UIkid.value),
        "withPets": UIpet.checked,
        "fromDate": check_in,
        "toDate": check_out,
        "firstName": document.getElementById('Fname').value,
        "lastName": document.getElementById('Lname').value,
        "phone": document.getElementById('phone').value,
        "email": document.getElementById('email').value,
        "paymentIntentAmount": quote
      }, (data) => {
        // window.location.href = data.paymentProvider
        console.log(data);
    })
}

// Quote
function getQuote(e){

    console.log(e);

    // let total = new Number(0)
    
    document.getElementById('acc-total').textContent = '$' + Math.round(Number(e.rentAmount))
    // document.querySelector('.avg-rate').textContent = Math.round(total / e.calendar.days.length)
    // document.querySelector('.night-no').textContent = e.calendar.days.length

    // if(e.calendar.days.length >= 7){
    //     document.querySelector('.week-notification').classList.remove('active')

    //     let discount;

    //     if(e.calendar.days.length >= 28){

    //         discount = Number(document.querySelector('#monthly-discount-pr').textContent)

    //         document.getElementById('acc-monthly-discount').textContent = '-$' + Math.round((total * discount) / 100)
    //         total = total - Math.round((total * discount) / 100)
    //         document.getElementById('monthly-discount').classList.remove('hidden')
    //         document.getElementById('weekly-discount').classList.add('hidden')

    //     } else{
    //         discount = Number(document.querySelector('#weekly-discount-pr').textContent)

    //         document.getElementById('acc-weekly-discount').textContent = '-$' + Math.round((total * discount) / 100)
    //         total = total - Math.round((total * discount) / 100)
    //         document.getElementById('weekly-discount').classList.remove('hidden')
    //         document.getElementById('monthly-discount').classList.add('hidden')

    //     }
    // } 

    let taxes = 0
    
    e.taxes.forEach(tax => {
        taxes += Number(tax.amount)
    })

    quote = e.scheduledPayments[0].amountToBePaid

    document.getElementById('acc-tax').textContent = '$' + Math.round(taxes)
    document.getElementById('acc-total-tax').textContent = '$' + Math.round( quote )

    UIbooking.classList.add('active')
    document.querySelector('.week-notification').classList.remove('active')
    UInoResults.classList.remove('active')        
}