function _extend(target, source) {
    for (let key of Object.keys(source)){
        if (target.hasOwnProperty(key) && typeof target[key] === "object") {
            extend(target[key], source[key])
        }
        else {
            target[key] = source[key];
        }
    }
    return target;
}

function extend(target, source) {
    if (source===null || source===undefined 
        || (Object.keys(source).length === 0 && source.constructor === Object)
        || typeof source === "number" || typeof source === "string"){
        return target;
    }
    else if (target===null || target===undefined) {
        return source;
    }
    else {
        return _extend(target, source);
    }
}

function $(className, type='div') {
    let node = document.createElement(type);
    node.className = className;
    return node;
}

class Calendar {
    constructor(options) {
        const US_WEEKS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const US_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const defaults = {
            weeks: US_WEEKS, months: US_MONTHS, id: 'clr', size: 400, startOfWeek: 1, abbreNumOfWeek: 2,
            color: {
                month_bg: 'LimeGreen', month_color: 'Cornsilk',
                year_bg: 'LightSeaGreen', year_color: 'LemonChiffon',
                week_bg: 'MediumPurple', week_color: 'white',
                day_bg: 'MintCream', day_color: 'Black',
                arrow: 'Gold',  timePicker_bg: 'MediumAquamarine', timePicker_opacity: 0.5,
            }
        }

        extend(this, defaults);
        extend(this, options);

        let rearrangement = [];
        this.weeks.forEach((element, i) => {
            rearrangement[(i - this.startOfWeek) < 0 ? (i - this.startOfWeek) + 7 : (i - this.startOfWeek)] = element.substring(0, this.abbreNumOfWeek);
        });

        this.weeks = rearrangement;
        this.hook = ()=>{};
        this.node = null;
        this.date = new Date;
        this.today = new Date;
        this.hours = this.today.getHours();
        this.minutes = this.today.getMinutes();
        this.isPM = this.hours >=12? 1: 0;
        this.draw();
        this.drawTimePicker();
    }

    draw() {
        const backSvg =
            `<svg style="width: 24px; height: 24px;" viewBox="0 0 24 24"><path fill="${this.color.arrow}" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path></svg>`;
        const nextSvg =
            `<svg style="width: 24px; height: 24px;" viewBox="0 0 24 24"><path fill="${this.color.arrow}" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"></path></svg>`;
        const id = this.id;
        // "clr-calendar"
        const namespace = `${id}-calendar`;

        const container = $(namespace);
        this.node = container;
        container.id = id;
        container.style.setProperty("position", "absolute");
        container.style.setProperty("top", "0px");
        container.style.setProperty("left", "0px");
        container.style.setProperty("--clr-width-size",`${this.size}px`);
        container.style.setProperty("--clr-font-size", `calc(var(--clr-width-size)/10)`);

        const context = $(`${namespace}__context`);
        context.style.setProperty("width", "var(--clr-width-size)");
        context.style.setProperty("font-size", "var(--clr-font-size)");
        container.appendChild(context);

        let headers = [];
        let name = ['year', 'month', 'week', 'day']
        let color = this.color;

        for (let q = 0; q < 4; q++) {
            headers[q] = $(`${namespace}__${name[q]}`)
            var cell = headers[q];
            switch (q) {
                case 0:
                    // year
                    cell.style.backgroundColor = color.year_bg;
                    cell.style.color = color.year_color;

                    var o = document.createElement('div');
                    o.id = id + '-year-back';
                    // set click callback
                    o.addEventListener('click', ()=>{this.shiftYear(false)});
                    o.innerHTML = backSvg;
                    cell.appendChild(o);

                    var n = document.createElement('span');
                    n.id = id + '-year';
                    cell.appendChild(n);

                    var m = document.createElement('div');
                    m.id = id + '-year-next';
                    // set click callback
                    m.addEventListener('click', ()=>{this.shiftYear(true)});
                    m.innerHTML = nextSvg;
                    cell.appendChild(m);
                    break;
                case 1:
                    // month
                    cell.style.backgroundColor = color.month_bg;
                    cell.style.color = color.month_color;

                    m = document.createElement('div');
                    m.id = id + '-month-back';
                    m.innerHTML = backSvg;
                    // set click callback
                    m.addEventListener('click', ()=>{this.shiftMonth(false)});
                    cell.appendChild(m);

                    n = document.createElement('span');
                    n.id = id + '-month';
                    cell.appendChild(n);

                    o = document.createElement('div');
                    o.id = id + '-month-next';
                    // set click callback
                    o.addEventListener('click', ()=>{this.shiftMonth(true)});
                    o.innerHTML = nextSvg;
                    cell.appendChild(o);
                    break;
                case 2:
                    // week
                    cell.style.backgroundColor = color.week_bg;
                    cell.style.color = color.week_color;
                    // set week headers
                    for (let q = 0; q < 7; q++) {
                        let s = document.createElement("span");
                        s.id = id + "-week-" + (q + 1);
                        s.appendChild(document.createTextNode(this.weeks[q]));
                        cell.appendChild(s);
                    }
                    break;
                default:
                    break;
            }
        }

        // draw days
        let rows = [];

        for (let i = 0; i < 6; i++) rows[i] = $(`${namespace}__day_row`);

        for (let g = 0, l = 0; l < 42; l++) {
            let rowLabel = $(`${namespace}__day_label`, 'label');
            let element = $(`${namespace}__day_num`, 'span');

            rowLabel.id = id + '-day-' + (l + 1);
            element.id = id + '-day-num-' + (l + 1);

            rowLabel.addEventListener('click', (event)=>{
                event.stopPropagation();
                if (rowLabel.classList.contains('clrlib-day-diluted')) {
                    if (rowLabel.firstChild.innerHTML.length > 0) {
                        let day = parseInt(rowLabel.firstChild.textContent);
                        if (day > l+1) {
                            this.date = new Date(this.date.getFullYear(), this.date.getMonth()-1, day);
                            this.update();
                        }
                        else  {
                            this.date = new Date(this.date.getFullYear(), this.date.getMonth()+1, day);
                            this.update();
                        }
                    }
                }
                else {
                    let selected = headers[3].querySelector('.selected');
                    if (selected) selected.classList.remove('selected');
                    rowLabel.firstChild.classList.add('selected');
                    this.date.setDate(parseInt(rowLabel.firstChild.textContent));
                }
            });

            rowLabel.appendChild(element);
            rows[g].appendChild(rowLabel);
            (l + 1) % 7 == 0 && g++;
        }

        // set style of days
        headers[3].style.backgroundColor = color.day_bg;
        headers[3].style.color = color.day_color;
        for (let k = 0; k < 6; k++) {
            // days
            headers[3].appendChild(rows[k]);
        }

        for (let u = 0; u < 4; u++) {
            // [year, month, week, day]
            context.appendChild(headers[u]);
        }
    }

    drawTimePicker() {
        let wrapper = $('tp-wrapper');
        let container = $("tp-container");
        let outer = $("tp-outer");
        let inner = $("tp-inner");
        let context = $("tp-context");
        let picker = $("tp-selector");
        let line_container = $("tp-line-container");
        line_container.id = this.id + '-line-container';
        let time_display = $("tp-display");
        let switch_am_pm = $("tp-AmPm");

        wrapper.appendChild(container);
        this.node.firstChild.appendChild(wrapper);
        // we need save the node picker because it will be called in moving function
        this.picker = picker;
        
        container.appendChild(outer);
        outer.appendChild(inner);
        inner.appendChild(context);
        context.appendChild(line_container);
        context.appendChild(time_display);
        context.appendChild(switch_am_pm);
        line_container.appendChild(picker);
        picker.style.backgroundColor = this.color.timePicker_bg;
        picker.style.opacity = this.color.timePicker_opacity;
        let lines = $("tp-lines");
        line_container.appendChild(lines);
        switch_am_pm.innerHTML = 
        `<div class="amOrpm">
            <div class="tp-btn"><button>AM</button></div>
            <div class="tp-btn"><button>PM</button></div>
        </div>
        <div class="date-check">
            <div class="tp-btn"><button>Check</button></div>
            <div class="tp-btn"><i>Now</i></div>
        </div>`;

        let removable = new drag(picker, drag.updateX, line_container);
        removable.hook = () => {
            let range = removable.cRect.width - removable.tRect.width;
            let translateX = removable.translateCurrent.x;
            translateX = translateX > range ? range : translateX > 0 ? translateX : -translateX;
            let currentSeconds = 720 * translateX / range;
        
            this.hours = Math.floor(currentSeconds / 60) + this.isPM * 12;
            this.minutes = Math.floor(currentSeconds) % 60;
        
            time_display.innerHTML = 
            `<div class="time-wrapper">
                <div><span>${Calendar.prettify(this.hours)}:${Calendar.prettify(this.minutes)}</span><span>${this.isPM ? "PM" : "AM"}</span>
                </div>
            </div>`;
        }

        let a = switch_am_pm.querySelectorAll(".tp-btn");
        a[0].addEventListener("click", (event)=> {
            event.stopPropagation();
            if (this.isPM) {
                this.isPM = 0;
                this.hours -= 12;
                this.updateTime();
            }
        });

        a[1].addEventListener("click", (event)=> {
            event.stopPropagation();
            if (!this.isPM) {
                this.isPM = 1;
                this.hours += 12;
                this.updateTime();
            }
        });

        a[2].addEventListener("click", ()=> {
            this.hook(new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), this.hours, this.minutes))
        });

        a[3].addEventListener("click", ()=>{
            this.hook(Date());
        });
    }

    update() {
        const id = this.id;
        const namespace = `${id}-calendar`;
        const diluted = `${namespace}__day_label clrlib-day-diluted`;
        const listed = `${namespace}__day_label clrlib-day-listed`;
        // <span id='clr-year'></span>
        document.getElementById(id + "-year").textContent = this.date.getFullYear();
        // <span id='clr-month'></span>
        document.getElementById(id + "-month").textContent = this.months[this.date.getMonth()];

        // initiate class attribution
        this.node.querySelectorAll(`.${namespace}__day_label`).forEach((element) => {
            element.className = listed;
            element.firstChild.className = `${namespace}__day_num`;
        });

        let startWeek = new Date(this.date.getFullYear(), this.date.getMonth(), 1).getDay();

        let offset = startWeek < this.startOfWeek ? startWeek + 7 - this.startOfWeek : startWeek - this.startOfWeek;

        let daysLastMon = Calendar.DaysOfLastMonth(this.date);

        let daysMon = Calendar.DaysOfMonth(this.date);

        for (let t = 0; t < offset; t++, daysLastMon--) {
            document.getElementById( id + '-day-num-' + (offset - t)).textContent = daysLastMon;
            document.getElementById( id + '-day-' + (offset - t)).className = diluted;
        }

        let days = this.node.querySelector(`.${namespace}__day`);

        for (let q = 1; q <= daysMon; q++) {
            let cell = document.getElementById( id + "-day-num-" + (q + offset));
            cell.textContent = q;
            if (q == this.date.getDate()) {
                let p = days.querySelector('.selected');
                if (p) {
                    p.classList.remove('selected');
                }
                cell.classList.add('selected');
            }

            if (this.today.getDate() == q && this.today.getFullYear() == this.date.getFullYear() &&
                this.today.getMonth() == this.date.getMonth()) cell.classList.add('today');
        }

        for (let o = daysMon + 1, d = 1; o + offset <= 42; o++, d++) {
            document.getElementById(id + "-day-num-" + (o + offset)).textContent = d;
            document.getElementById(id + "-day-" + (offset + o)).className = diluted;
        }
    }

    updateTime() {
        let html = '';
        let time_display = this.node.querySelector('.tp-display');
        let lines = this.node.querySelector(".tp-lines");
        for (let o=0; o<=12; o++) {
            html = html + `<div class="line"><div class="shape"></div><span>${o + this.isPM * 12}</span></div>`;
        }
        time_display.style.backgroundColor = this.isPM ? "#235198":"white";
        time_display.style.color = this.isPM ? "white":"black";
        lines.innerHTML = html;
        time_display.innerHTML = 
        `<div class="time-wrapper">
            <div><span>${Calendar.prettify(this.hours)}:${Calendar.prettify(this.minutes)}</span><span>${this.isPM ? "PM" : "AM"}</span></div>
        </div>`;
    }

    refresh() {
        this.date = new Date;
        this.today = new Date;
        let hours = this.today.getHours();
        let minutes = this.today.getMinutes();
        this.hours = hours;
        this.minutes = minutes;
        this.isPM = hours >=12? 1: 0;
        this.update();
        this.updateTime();
        let line_container = document.getElementById(this.id + '-line-container');
        let picker = line_container.querySelector(".tp-selector");
        let max = line_container.getBoundingClientRect().width - picker.getBoundingClientRect().width;
        if (max) {
            requestAnimationFrame(() => {
                picker.style.transform = "translate(" + max * ((hours % 12)*60 + minutes) / 720 + "px," + 0 + "px)";
            });
        }
    }

    show() {
        // construct complete dom node
        if (document.body.contains(this.node)) {
            this.refresh();
        }
    }

    shiftMonth(increase=true) {
        let t = this.date;
        let s = new Date(t.getFullYear(), t.getMonth() + (increase? 2 : 0), 0);
        t.setFullYear(s.getFullYear()), t.setMonth(s.getMonth()), t.setDate(Math.min(t.getDate(), s.getDate()));
        this.update();
    }

    shiftYear(increase=true) {
        let t = this.date;
        if (t.getMonth() == 1 && t.getDate() == 29) t.setDate(28);
        t.setFullYear(t.getFullYear() + (increase ? 1 : -1));
        this.update();
    }

    static DaysOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    static DaysOfLastMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    }

    static prettify = (num) => {
        if (num < 10) return `0${num}`;
        return `${num}`;
    }
}

