let btns = document.querySelectorAll('.button');

btns.forEach(btn => {
    btn.addEventListener('click', switchCurrentButton);
});


function switchCurrentButton(event) {
    var div_content_str;
    btns.forEach(btn => {
        if(btn.classList.contains('current')) {
            btn.classList.remove('current');
        }
        if(event.target == btn) {
            btn.classList += ' current';
            div_content_str = btn.id.split('-')[0];
        }
    }); 
    let divs = document.querySelectorAll('.forening-content');
    divs.forEach( node => {
        if(node.classList.contains('current')) {
            node.classList.remove('current');
        }
        if(node.id == div_content_str) {
            node.classList += ' current';
        }
    });
}