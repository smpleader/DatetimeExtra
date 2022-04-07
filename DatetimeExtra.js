/**
 * 
 * @project DatetimeExtra
 * @desc Solve datetime calculation relate to AD and BC time
 * @url https://github.com/smpleader/DatetimeExtra/
 * @author Pham Minh
 * @email smpleader@gmail.com
 * @license MIT ( No warranty, risk at your side )
 *  
 */

function DatetimeExtra(date = null)
{
    if( date instanceof DatetimeExtra ) return date
    return this.set(date)
}

function dtextra(date = null)
{
    return new DatetimeExtra(date)
}

DatetimeExtra.prototype = {
    valid: function( date, collect = false)
    {
        if('string' !== typeof date) return false
        
        let d = date.split("T")[0].split("-") 
        
        if( d.length === 3 )
        {
            [year, month, day] = d
            ad = true
        }
        else if( d.length === 4)
        {
            [x, year, month, day] = d
            ad = false
        }
        else return false
        
        year = year.replace( /^\D+/g, '')
        if(year.length > 4 || year.length == 0) return false

        month = month.replace( /^\D+/g, '')
        if(month.length > 2 || month.length == 0 || month > 12) return false

        day = day.replace( /^\D+/g, '')
        if(day.length > 2 || day.length == 0 || day > 31) return false

        if(collect) this.bind(ad, ( ad ? 1 : -1) * year, parseInt(month), parseInt(day))

        return true
    },

    bind: function(AD, year, month, day)
    {
        this.AD = AD
        this.year = year
        this.month = month
        this.day = day
        this.full = [year, month, day].join("-")
    },

    set: function(date = null)
    {
        if(null === date)
        {
            let now = new Date()
            this.bind(true, now.getFullYear(), now.getMonth(), now.getDay())
            return this
        }
        else if( this.valid(date, true) )
        {
            return this
        }

        this.full = null
        return false
    },

    /*get: function(key = null)
    {
        switch(key.toLowerCase())
        {
            case "ad": return this.AD
            case "year": return this.year
            case "month": return this.month
            case "day": return this.day
            default: return this.full
        }
    },*/

    // this is alternative to PHP datetime
    format: function(reg = "Y-m-d")
    { 
        if( null === this.full )
        {
            console.warn("Invalid inputed date !")
            return false
        }

        if( "function" === typeof reg) return reg(this)

        strY =  this.year.toString()
        stry = strY > 3 ? strY.substr(2, 2) : ( strY > 2 ? strY.substr(1, 2) :  strY )

        return  reg.replaceAll("Y", strY )
                .replaceAll("y", stry)
                .replaceAll("m", this.month )
                .replaceAll("d", this.day )
    },

    diffYear: function(toDate)
    {
        if( null === this.full )
        {
            console.warn("Invalid inputed date !")
            return false
        }

        let d = new DatetimeExtra(toDate)
        if(false === d) return 0

        //if( d.year < this.year ) return false
        
        return d.year - this.year
    },

    diffMonth: function(toDate)
    {
        if( null === this.full )
        {
            console.warn("Invalid inputed date !")
            return false
        }

        let d = new DatetimeExtra(toDate)
        if(false === d) return 0

        let toNum = d.year + this.monthPercentOfYear( d.month )       
        let num = this.year + this.monthPercentOfYear( this.month ) 

        //if( toNum < num ) return false
        
        return  Math.floor ( (toNum - num) * 12 ) 
    },

    monthPercentOfYear: function(month)
    {
        //console.log("monthPercentOfYear" , month, Math.round( 100 * ( month / 12 ) ) / 100 )
        return Math.round( 100 * ( month / 12 ) ) / 100  
    },
    
    dateToDay: function(date) {
        var feb = daysInFebruary(date.getFullYear());
        var aggregateMonths = [0, // January
                                31, // February
                                31 + feb, // March
                                31 + feb + 31, // April
                                31 + feb + 31 + 30, // May
                                31 + feb + 31 + 30 + 31, // June
                                31 + feb + 31 + 30 + 31 + 30, // July
                                31 + feb + 31 + 30 + 31 + 30 + 31, // August
                                31 + feb + 31 + 30 + 31 + 30 + 31 + 31, // September
                                31 + feb + 31 + 30 + 31 + 30 + 31 + 31 + 30, // October
                                31 + feb + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31, // November
                                31 + feb + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30, // December
                                ];
        return aggregateMonths[date.getMonth()] + date.getDate();
    },

    add: function(more, unit)
    {
        if( isNaN(more) )
        {
            console.error("Only numeric can be added")
            return false
        }

        if( "month" == unit || "months" == unit)
        {
            let y = this.year + this.monthPercentOfYear(more)
            this_year = Math.floor( y )
            let m = y - this_year
            this_month =  (m > 0 ) ? Math.round ( m * 12 ) : this.month
        }
        else
        {
            this_year = this.year + parseInt( more )
            this_month = this.month
        }

        ad = this_year > 0

        this.bind(ad, this_year, this_month, this.day)

        return this
    },

    subtract: function(less, unit)
    {
        if( isNaN(less) )
        {
            console.error("Only numeric can be subtracted")
            return false
        }

        if( "month" == unit || "months" == unit)
        {
            let y = this.year - this.monthPercentOfYear(less)
            this_year = Math.floor( y )
            let m = y - this_year
            this_month =  (m > 0 ) ? Math.round ( m * 12 ) : this.month
        }
        else
        {
            this_year = this.year - parseInt( less )
            this_month = this.month
        }

        ad = this_year > 0

        this.bind(ad, this_year, this_month, this.day)

        return this
    },

    isAfter: function(date)
    {
        let d = new DatetimeExtra(date)

        if( this.year > d.year ||
            ( this.year == d.year && this.month > d.month) 
        ) return true

        return false 
    },

    isBefore: function(date)
    {
        let d = new DatetimeExtra(date)

        //console.log( this.year < d.year , this.year , d.year)
        if( this.year < d.year ||
            ( this.year == d.year && this.month < d.month) 
        ) return true

        return false 
    },

    clone: function(newObject = true)
    {
        return newObject ? new DatetimeExtra(this.full) : this.full;
    },

    isSame: function(date, unit = "year")
    {
        let d = new DatetimeExtra(date)

        if ( "day" == unit || "days" == unit)
        {
            return this.year == d.year && this.month == d.month && this.day == d.day
        }
        if ( "month" == unit || "months" == unit)
        {
            return this.year == d.year && this.month == d.month
        }
        else
        {
            return this.year == d.year
        }
    },
    
}
