window.addEventListener("DOMContentLoaded", function() {
    let calendar =  new Calendar({size: 280});
    document.body.prepend(calendar.node);
    calendar.show();
})


