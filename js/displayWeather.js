import { getWeatherDataAt } from "./getWeatherData.js";

// array containing strings matching cloudiness integer (0-8)
const cloudiness_strings = [
    'Klar himmel',
    'Nästan klar himmel',
    'Himmel med enstaka moln',
    'Himmel med flera moln',
    '50% moln',
    'Molnigt med lite himmel',
    'Molnigt',
    'Mycket molnigt',
    'Endast moln'
];


/*
    this function takes data for one day and units and returns a html-table element from the data
*/
function createWeatherTable(units, day_data) {
    let table = document.createElement('table');
    table.id = 'weather-table';

    let table_header = document.createElement('thead');
    let table_header_row = document.createElement('tr');
    
    let table_header_time = document.createElement('th');
    table_header_time.innerText = 'Klockan';

    let table_header_temp = document.createElement('th');
    table_header_temp.innerText = 'Temp';

    let table_header_windspeed = document.createElement('th');
    table_header_windspeed.innerText = 'Vindstyrka';

    let table_header_wind_dir = document.createElement('th');
    table_header_wind_dir.innerText = 'Vindriktning';

    let table_header_clouds = document.createElement('th');
    table_header_clouds.innerText = 'Himmel';

    table_header_row.appendChild(table_header_time);
    table_header_row.appendChild(table_header_temp);
    table_header_row.appendChild(table_header_windspeed);
    table_header_row.appendChild(table_header_wind_dir);
    table_header_row.appendChild(table_header_clouds);
    table_header.appendChild(table_header_row);

    let table_body = document.createElement('tbody');
    for(let i = 0; i < day_data.data.length; i++) {
        let temp_row = document.createElement('tr');
        for(let j = 0;  j< day_data.data[i].length; j++) {
            let temp_td = document.createElement('td');
            if(day_data.data[i][j] == '-') {
                temp_td.innerText = '-';
            } else if(units[j] == 'octas') {
                temp_td.innerText = cloudiness_strings[day_data.data[i][j]]; 
            } else {
                temp_td.innerText = day_data.data[i][j] + ( units[j] == 'h' ? ':00' : ' ' + units[j] );
            }
            
            temp_row.appendChild(temp_td);
        }
        table_body.appendChild(temp_row);
    }
    
    table.appendChild(table_header);
    table.appendChild(table_body);

    return table;
}

function displayWeatherData(weather_data) {

    let weather_title = document.createElement('h2');
    weather_title.innerText = 'Väder';
    weather_title.classList += 'green-bgd';
    let title_today = document.createElement('h3');
    title_today.innerText = 'Idag';

    let today_date = document.createElement('h4');
    today_date.innerText = weather_data[1].date;
    today_date.classList += 'dark-bgd';

    let title_tomorrow = document.createElement('h3');
    title_tomorrow.innerText = 'Imorgon';

    let tomorrow_date = document.createElement('h4');
    tomorrow_date.innerText = weather_data[2].date;
    tomorrow_date.classList += 'dark-bgd';

    let table_today = createWeatherTable(weather_data[0], weather_data[1]);

    let table_tomorrow = createWeatherTable(weather_data[0], weather_data[2]);

    document.getElementById('smhi-widget').appendChild(weather_title);

    document.getElementById('smhi-widget').appendChild(title_today);
    document.getElementById('smhi-widget').appendChild(today_date);
    document.getElementById('smhi-widget').appendChild(table_today);

    document.getElementById('smhi-widget').appendChild(title_tomorrow);
    document.getElementById('smhi-widget').appendChild(tomorrow_date );
    document.getElementById('smhi-widget').appendChild(table_tomorrow);
}

getWeatherDataAt('18.1489', '57.3081')
.then( (data) => {
    displayWeatherData(data);
});

