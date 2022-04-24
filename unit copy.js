const unitId = document.querySelector('.id-text').textContent
let UIbookLink = document.querySelector('#booking')
let UIpet = document.querySelector('#pets')

let UInoResults = document.querySelector('.noresults-box')
let UIbooking = document.querySelector('.booking-box')

if(window.sessionStorage.getItem('search') != null){

    const search = JSON.parse(sessionStorage.getItem('search'));

    let UIcheckin = document.querySelector('#checkin')
    let UIguest = document.querySelector('#guests')

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

    searcher(unitId, document.querySelector('.city-text').textContent)
} 

document.getElementById('search-btn').addEventListener('click', (e) => {
    e.preventDefault()

    searcher(unitId, document.querySelector('.city-text').textContent)
})

//Search Function
function searcher(id, city){
    const container = document.getElementById('wf-form-Search-Form')
    let UIcheckin = container.querySelector('#checkin')
    let guests = container.querySelector('#guests').value

    let a = 0

    container.querySelectorAll('input').forEach( e => {
        if( e.value == '' && a == 0){
            alert('Please fill all the required fields')
            a = 1
        }
    })

    let vals = UIcheckin.value.split('/')

    let check_in = vals[0];
    let check_out = vals[1];

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

    xhr.get(`https://connect.uplisting.io/availability?${criteria}`, data => {

        if(data.data.find( x => x.id == id) != null && a == 0){
            let slug = data.data.find( x => x.id == id).attributes.property_slug

            bookLink(container, slug)

            xhr.get(`https://connect.uplisting.io/calendar/${id}?from=${check_in}&to=${check_out}`, e => {

                let total = new Number(0)
                
                e.calendar.days.forEach( a => {
                    total += a.day_rate
                })
                
                document.getElementById('acc-total').textContent = '$' + Math.round(total)
                document.querySelector('.avg-rate').textContent = Math.round(total / e.calendar.days.length)
                document.querySelector('.night-no').textContent = e.calendar.days.length

                if(e.calendar.days.length >= 7){
                    document.querySelector('.week-notification').classList.remove('active')

                    let discount;

                    if(e.calendar.days.length >= 28){

                        discount = Number(document.querySelector('#monthly-discount-pr').textContent)

                        document.getElementById('acc-monthly-discount').textContent = '-$' + Math.round((total * discount) / 100)
                        total = total - Math.round((total * discount) / 100)
                        document.getElementById('monthly-discount').classList.remove('hidden')
                        document.getElementById('weekly-discount').classList.add('hidden')

                    } else{
                        discount = Number(document.querySelector('#weekly-discount-pr').textContent)

                        document.getElementById('acc-weekly-discount').textContent = '-$' + Math.round((total * discount) / 100)
                        total = total - Math.round((total * discount) / 100)
                        document.getElementById('weekly-discount').classList.remove('hidden')
                        document.getElementById('monthly-discount').classList.add('hidden')

                    }
                } 

                const tax = (total * 0.14625) 

                document.getElementById('acc-tax').textContent = '$' + Math.round(tax)
                document.getElementById('acc-total-tax').textContent = '$' + Math.round( total + tax)

            })

        } else{
            document.getElementById('weekly-discount').classList.add('hidden')
            document.getElementById('monthly-discount').classList.add('hidden')
            UIbooking.classList.remove('active')
            UIbookLink.href = `#`

            let no = Math.floor((Date.parse(check_out) - Date.parse(check_in)) / 86400000)

            if( no < 7 ){

                document.querySelector('.week-notification').classList.add('active')
                UInoResults.classList.remove('active')
            }else{
                document.querySelector('.week-notification').classList.remove('active')
                UInoResults.classList.add('active')

            }
            
        }

    })
}

function bookLink(container, slug){
    let UIcheckin = container.querySelector('#checkin')
    let guests = container.querySelector('#guests').value

    let vals = UIcheckin.value.split('/')

    let check_in = vals[0];
    let check_out = vals[1];

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

    UIbookLink.href = `https://abodebyurby.bookeddirectly.com/g/payment/new?${criteria}property_slug=${slug}`

}
