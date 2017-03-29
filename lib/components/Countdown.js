/**
 * DO NOT EDIT: This file should not be edited by creative developer
 *
 * Countdown component
 */

import moment from 'moment'
import 'moment-duration-format'

export default {
  template: '<span>{{ countdown }}</span>',
  props: {
    from: {
      required: true,
    },
    format: {
      default: 'H:m:s',
    },
    interval: {
      default: 1000
    }
  },
  data() {
    return {
      countdown: ''
    }
  },
  ready() {
    let countFrom = moment.parseZone(this.from)
    let now = moment.utc().utcOffset(countFrom.utcOffset())
    let nowToCountFrom = moment.duration(now.diff(countFrom, 'ms'))

    setInterval(() => {
      nowToCountFrom.subtract(this.interval, 'ms')
      this.countdown = nowToCountFrom.format(this.format)
    }, this.interval)
  },
}

/*
 <countdown
    from="2016-02-12T00:00:00+00:00"
    format="D [days] H [hours] m [minutes] s [seconds] S [ms]"
    interval="500"
 ></countdown>
 */