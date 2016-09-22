import moment from 'moment';

export default {
  template: '<span>{{ time }}</span>',
  props: {
    format: {
      required: true,
    },
    utcOffsetMinutes: {
      required: true,
    }
  },
  data() {
    return {
      time: null
    }
  },
  ready() {
    let now = moment().utcOffset(this.utcOffsetMinutes);
    setInterval(() => {
      this.time = now.add(1, 'seconds').format(this.format);
    }, 1000);
  },
}