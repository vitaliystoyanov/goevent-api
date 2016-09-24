/**
 * Function create a string of current date
 * @return {string} Current date in format yyyy-mm-dd
 */
const getCurrentDate = () => {
    const checkZero = item => {
        if (item < 10) {
            item = '0' + item;
        }

        return item;
    };
    let year = new Date().getFullYear() + '-';
    let month = (checkZero(new Date().getMonth() + 1)) + '-';
    let day = checkZero(new Date().getDate());

    return year.concat(month).concat(day);
};

module.exports = {
    getCurrentDate
};