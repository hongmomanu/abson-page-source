import {CountryArr} from './consts';
export function makeCountry(str) {
    for (var i = 0; i < CountryArr.length; i++) {
        console.log('makeCountry', CountryArr[i], str + '-', CountryArr[i].includes((str + '-')));
        if (CountryArr[i].includes(str + '-')) {
            console.log('makeCountry done', CountryArr[i].split("-")[1])
            return CountryArr[i].split("-")[1];
        }
    }
    return str;
}
export function getDateOfISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}
export function getCurrentWeek() {
    var now = new Date();
    var onejan = new Date(now.getFullYear(), 0, 1);
    return (Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7));
}

export function makeDou(str) {
    if (str < 10) return `0${str}`;
    else return `${str}`;
}