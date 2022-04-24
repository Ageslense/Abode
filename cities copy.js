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
    let UIguest = document.querySelector('#guest')

    if( search.check_in != "" ){
        UIcheckin.value = `${search.check_in}/${search.check_out}`
    }
    if( search.guests != undefined ){
        UIguest.value = search.guests
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

async function populator(data){
  
    const properties = data.data
    const UIProp = document.querySelectorAll('.unit')

    let i = 0

    UIProp.forEach( e => {

        let a = 0

        const data = await getPrice(`https://connect.uplisting.io/calendar/${e.querySelector('.id-text').textContent}?from=${check_in}&to=${check_out}`)

        if( properties.find( x => x.id == e.querySelector('.id-text').textContent) == null ){
            e.parentElement.style.display = 'none'
            i++
            a++

        } else{
            e.parentElement.style.display = 'block'
            

            let totalPrice = 0;

            data.days.forEach( e => {
                price = totalPrice + e.day_rate
            })

            const price = Math.round(totalPrice / data.days.length)

            e.parentElement.querySelector('city-unit-price').textContent = price
        }

        if(pets == true){

            if(e.querySelector('.pet-friendliness').textContent.includes('Not')){
                e.parentElement.style.display = 'none'

                if( a < 1 ){
                    i++
                }
            }
        }
    })

    if(i == UIProp.length){
        document.querySelector('.units__no-results').style.display = 'block'
    } else{
        document.querySelector('.units__no-results').style.display = 'none'
    }

}

function searcher(){
    const container = document.getElementById('wf-form-Search-Form')
    let UIcheckin = container.querySelector('#checkin')
    let guests = container.querySelector('#guest').value

    let vals = UIcheckin.value.split('/')

    check_in = vals[0];
    check_out = vals[1];

    criteria = ''

    if( check_in != '' ){
        criteria += `check_in=${check_in}&`

    }
    if( check_out != '' ){
        criteria += `check_out=${check_out}&`

    }
    if( guests != '' ){
        criteria += `number_of_guests=${guests}&`
    }

    criteria += `city=${city}`

    const item = {
        check_in: check_in,
        check_out: check_out,
        guests: guests,
        pet: UIpet.checked
    }

    console.log(item);

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
        xhr.get(`https://connect.uplisting.io/availability?${criteria}`, data => populator(data))
        document.querySelector('.grid-3').style.display = 'grid'

    }


}

document.getElementById('checkin').setAttribute('readonly', true);

// Calendar function
async function getPrice(URL){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Basic " + btoa("e4d9aa02-e2b1-4620-8706-b7979cdcff65"));

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    const response = await fetch(URL, requestOptions)

    const data = await response.json()

    console.log(data);

    return data;
}
