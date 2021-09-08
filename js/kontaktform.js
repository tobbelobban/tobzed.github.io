
document.getElementById("select-contact-type").addEventListener("change", change_selected);

function change_selected(event) {
    let selected_id_str = event.target.value + '-input';
    let input_container = document.getElementById('input-container');
    
    input_container.childNodes.forEach( node => {
        if(node.nodeName == 'P') {
            node.childNodes.forEach( p_child => {
               if(p_child.nodeName == 'INPUT') {
                   if(p_child.id == selected_id_str) {
                       p_child.disabled = false;
                       p_child.required = true;
                   } else {
                       p_child.required = false;
                       p_child.disabled = true;
                   }
               } 
            });
        }
    });
}