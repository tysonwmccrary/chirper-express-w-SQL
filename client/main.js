//Create Variables to store inside each id with the main.css.
var $chirpButton = $('#chirp-btn');
var $chirpField = $('#chirp-field');
var $chirpList = $('#chirp-list');
var $userSelector = $('#user-selector');

//Attaches an event handler function to disable chirp button when text field is empty.
$chirpField.on('input', function () {
    var isEmpty = $chirpField.val().length === 0;
    $chirpButton.prop('disabled', isEmpty);
});
$chirpButton.click(postChirp);

//Create function postChirp with variable chirp as an object.
function postChirp() {
    var chirp = { //message and userid comes from the chirp database.
        message: $chirpField.val(),
        userid: $userSelector.val()
    };
    console.log(chirp);

    //And use ajax to enteract with the SQL chirp database.

    //This will post the new chirps into the SQL chirp database.
    $.ajax({
        method: 'POST',
        url: '/api/Allchirps',
        contentType: 'application/json',
        data: JSON.stringify(chirp)
    }).then(function (success) { // successfully POST new data to the server
        $chirpField.val('');
        $chirpButton.prop('disabled', true);
        getChirps();
    }, function (error) {
        console.log(error);
    });
}

//This will recieve the chirps for the SQL chirper database.
function getChirps() {
    $.ajax({
        method: 'GET',
        url: '/api/Allchirps'
    }).then(function (Allchirps) {
        //console.log(chirps);
        $chirpList.empty();
        for (var i = 0; i < Allchirps.length; i++) {
            addChripDiv(Allchirps[i]);
        }
    }, function (error) {
        console.log(error);
    });
}
getChirps();

function addChirpDiv(chirp) {
    var $chirpDiv = $('<div class="chirp"></div>');
    var $message = $('<p></p>');
    var $user = $('<h4></h4>');
    var $timestamp = $('<h5></h5>');
    var $delButton = $('<button class="delete-button fancy-button red">Delete</button>');
    $delButton.click(function () {
        deleteChirp(chirp.id);
    });

    //Gives the value of the text "What the text actually is".
    $message.text(chirp.message);
    $user.text(chirp.username);
    $timestamp.text(new Date(chirp.timestamp).toLocaleString());

    //Places the variables into the chirpDiv.
    $message.appendTo($chirpDiv);
    $user.appendTo($chirpDiv);
    $timestamp.appendTo($chirpDiv);
    $delButton.appendTo($chirpDiv);

    //Places the chirpDiv into the chirpList Div.
    $chirpDiv.appendTo($chirpList);
}

//Use ajax to delete chirps for the SQL chirper database, Allchirps Table.
function deleteChirp(id) {
    $.ajax({
        method: 'DELETE',
        url: '/api/Allchirps/' + id
    }).then(function () {
        getChirps();
    }, function (error) {
        console.log(error);
    });
}

//Use ajax to use the user that are in SQL chirper database, User Table.
function populateUsers() {
    $.ajax({
        method: 'GET',
        url: '/api/users'
    }).then(function (users) {
        for (var i = 0; i < users.lenght; i++) {
            var $userOption = $('<option value="' + users[i].id + '">' + users[i].name + '</option>');
            $userSelector.append($userOption);
        }
    }, function (error) {
        console.log(error);
    });
}
populateUsers();