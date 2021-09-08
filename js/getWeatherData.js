/*
    this array contains which times to display for the current day, depending on what time it is
    CEST_times: if the current time (CEST/UTC+2) is in one of the arrays for CEST_times, the times to get from the JSON (which is UTC+0)
    is given by the corresponding UTC_times.
    Naturally this only works for UTC+2 local times.
*/
const CEST_to_UTC = [
    {
        CEST_times: ['00', '01', '02', '03', '04', '05', '06', '07', '08'], // these current times in CEST should display weather for these CESTs 9:00, 12:00 and 15:00 on site
        UTC_times: ['07','10','13']             // which in the JSON corresponds to these times in UTC+0
    },
    {
        CEST_times: ['09'],           // display 11:00, 14:00 amd 17:00 on site
        UTC_times: ['09', '12', '15']
    },
    {
        CEST_times: ['10'],           // display 12:00, 15:00 amd 18:00 on site
        UTC_times: ['10', '13', '16']
    },
    {
        CEST_times: ['11', '12'],       //and so on ...
        UTC_times: ['12', '15', '17']
    },
    {
        CEST_times: ['13', '14'],
        UTC_times: ['13', '16', '19']
    },
    {
        CEST_times: ['15', '16'],
        UTC_times: ['15', '17', '19']
    },
    {
        CEST_times: ['17', '18'],
        UTC_times: ['17', '18', '19']
    },
    {
        CEST_times: ['19'],
        UTC_times: ['18', '19', '20']
    },
    {
        CEST_times: ['20'],
        UTC_times: ['19', '20', '21']
    },
    {
        CEST_times: ['21'],
        UTC_times: ['20', '21', '-']
    },
    {
        CEST_times: ['22'],
        UTC_times: ['21', '-', '-']
    },
    {
        CEST_times: ['23'],
        UTC_times: ['-', '-', '-']
    }
];

//UTC+0 times for tomorrow 
const tomorrow_times = ['07', '11', '15'];

export function getWeatherDataAt(lon,lat) {
    let url =  "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/" + lon + "/lat/" + lat + "/data.json";
    return fetch(url)
    .then( ( response ) => {
        return response.json();
    })
    .then( ( data ) => {

        // create date objects for today and tomorrow (local time, CEST)
        let today = new Date();
        let tomorrow = new Date(today.getTime() + (24 * 3600 * 1000)); 

        // get today and tomorrows' date as strings, YYYY-MM-DD
        let date_today = getDateString(today);
        let date_tomorrow = getDateString(tomorrow);

        // find which times to display in site
        let UTC_times = getUTCtimes(today.getHours());

        // this array will contain the data we want to present on site
        let weather_data = new Array(3);
        
        // this array identifies the unit for each column in the data matrices
        weather_data[0] = ['h', 'C', 'm/s', 'grader', 'octas'];
        
        weather_data[1] = {
            date: date_today, // we save the date
            data: []        // this array will be a matrices containing our data, rows = times, columns = unit : times x units
        };

        weather_data[2] = {
            date: date_tomorrow,
            data: []
        };

        // because there is data for 10 days in JSON and we might not want to iterate over 10 days worth of data, we create a counter to check if we have all the data we are interested in
        let counter = 0;

        // initialize matrices and set counter
        for(let i = 0; i < UTC_times.length; i++) {
            weather_data[1].data[i] = new Array(weather_data[0].length);
            if(UTC_times[i] == '-') {
                for(let j = 0; j < weather_data[0].length; j++) {
                    weather_data[1].data[i][j] = '-';
                }
            } else {
                counter++;
            }
        }

        for(let i = 0; i < tomorrow_times.length; i++) {
            weather_data[2].data[i] = new Array(weather_data[0].length);
            counter++;
        }

        // find data and populate matrices
        for(let i = 0; i < data.timeSeries.length; i++) {
            if(counter == 0) { // so that we don't iterate over more data than we need to
                return weather_data;
            }
            let data_date = data.timeSeries[i].validTime.slice(0,10);
            if(data_date == date_today) { // if correct day
                let data_hour = data.timeSeries[i].validTime.slice(11,13);
                for(let j = 0; j < UTC_times.length; j++) {
                    if(UTC_times[j] == data_hour) { // if a time we are interested in, store data
                        weather_data[1].data[j][0] = parseInt(UTC_times[j]) + 2;
                        weather_data[1].data[j][1] = data.timeSeries[i].parameters.filter(para => para.name == "t")[0].values[0];
                        weather_data[1].data[j][2] = data.timeSeries[i].parameters.filter(para => para.name == "ws")[0].values[0];
                        weather_data[1].data[j][3] = data.timeSeries[i].parameters.filter(para => para.name == "wd")[0].values[0];
                        weather_data[1].data[j][4] = data.timeSeries[i].parameters.filter(para => para.name == "tcc_mean")[0].values[0];
                        counter--;
                    }
                }
            } else if(data_date == date_tomorrow) {
                let data_hour = data.timeSeries[i].validTime.slice(11,13);
                for(let j = 0; j < tomorrow_times.length; j++) {
                    if(tomorrow_times[j] == data_hour) {
                        weather_data[2].data[j][0] = parseInt(tomorrow_times[j]) + 2;
                        weather_data[2].data[j][1] = data.timeSeries[i].parameters.filter(para => para.name == "t")[0].values[0];
                        weather_data[2].data[j][2] = data.timeSeries[i].parameters.filter(para => para.name == "ws")[0].values[0];
                        weather_data[2].data[j][3] = data.timeSeries[i].parameters.filter(para => para.name == "wd")[0].values[0];
                        weather_data[2].data[j][4] = data.timeSeries[i].parameters.filter(para => para.name == "tcc_mean")[0].values[0];
                        counter--;
                    }
                }          
            }
        }
        
        // if we get here then we didn't find all data, default missing values to '-'
        for(let i = 1; i < weather_data.length; i++) {
            for(let j = 0; j < weather_data[i].data.length; j++) {
                for(let k = 0; k < weather_data[i].data[j].length; k++) {
                    if( typeof weather_data[i].data[j][k] == 'undefined' ) {
                        weather_data[i].data[j][k] = '-';
                    }
                }
            }
        }
        return weather_data;
    });
}

// return string YYYY-MM-DD from date object
function getDateString(date) {
    return  date.getFullYear() + '-' + 
            ( date.getMonth() < 9 ? '0' + (date.getMonth()+1) : (date.getMonth()+1) ) + '-' + // getmonth() returns 0-index for months (0-11), so +1 for string
            ( date.getDate() < 10 ? '0' + date.getDate() : date.getDate() );
}

// get UTC_times array from current CEST time
function getUTCtimes(current_hour) {
    for(let i = 0; i < CEST_to_UTC.length; i++) {
        for(let j = 0; j < CEST_to_UTC[i].CEST_times.length; j++) {
            if( CEST_to_UTC[i].CEST_times[j] == current_hour) {
                return CEST_to_UTC[i].UTC_times;
            }
        }
    }
    return ['-', '-', '-'];
}