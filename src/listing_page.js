function PullLink() {
    // direction should be either 'pull'(to grab the link) or 'place'(to place the link)

    let input_link = 'no input_link inputted';

    //pull the inputted text(the link) from the input feild
    input_link = document.getElementById('link_input').value;

    //save it for the session
    sessionStorage.setItem('input_link', input_link);
    console.log('link inputted' + input_link);
}


function PlaceLink() {
    //pull the saved link
    let saved_link = sessionStorage.getItem('input_link');

    //set the text and the href link to the link
    document.getElementById('link_placing').innerHTML = 'Product Link';
    document.getElementById('link_placing').href = saved_link;
    console.log(saved_link)

    //for amazon
    //name is inbetween slashes so split the link in those
    let title_dashed = saved_link.split('/')[3].split('-');
    console.log('dashed title:',title_dashed);
    
    //create title
    let title = ''
    //loop through parts of title and add them
    for(i = 0; i < title_dashed.length; i++){
        title = title + ' ' + title_dashed[i]
    }

    //set the HTML title slot to the title
    document.getElementById('product_name').innerHTML = title
    
}


//when the page loads call link placing, and 
document.addEventListener('DOMContentLoaded', PlaceLink());