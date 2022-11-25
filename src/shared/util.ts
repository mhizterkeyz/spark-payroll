import * as moment from 'moment';

export class Util {
  static WORK_DAYS = new Set([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);

  static calculateWorkDaysBetweenDates(
    dateOne: moment.Moment,
    dateTwo: moment.Moment,
  ) {
    const _dateOne = dateOne.clone();
    let days = 0;
    while (_dateOne.isSameOrBefore(dateTwo)) {
      if (Util.WORK_DAYS.has(_dateOne.format('dddd'))) {
        days += 1;
      }
      _dateOne.add(1, 'day');
    }

    return days;
  }

  static sum(...nums: number[]) {
    return +nums.reduce((acc, cur) => acc + cur, 0).toFixed(4);
  }

  static mul(...nums: number[]) {
    return +nums.reduce((acc, cur) => acc * cur, 1).toFixed(4);
  }

  static div(...nums: number[]) {
    return +nums.reduce((acc, cur) => acc / cur).toFixed(4);
  }

  static sub(...nums: number[]) {
    return +nums.reduce((acc, cur) => acc - cur).toFixed(4);
  }
}
