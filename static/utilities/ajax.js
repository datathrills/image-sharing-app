// Update likes

// $(function() {

//     $("body").click(function() {
//         console.log( "clicked");
//     });

// });

$(function() {

    $(".upvote-btn").on('click', function(event){
        console.log("button clicked!");
        event.stopPropagation();
        $.ajax({
            url: "/likes/" + $(this).attr('id'),
            type: "POST"
        }).done (function(result){
            console.log(result);
        }).fail(function(err){
            console.log(err);
        });
    });

});



// function update() {
//     $.ajax( {
//         url: "http://localhost:8081/data",
//         success: function(result) {
//             console.log(result);
//             for (var i in result) {
//                 var row = document.createElement("tr");
//                 var codeCell = document.createElement("td");
//                 var nameCell = document.createElement("td");
//                 var lecturerCell = document.createElement("td");
//                 $(codeCell).text(result[i]["code"]);
//                 $(nameCell).text(result[i]["name"]);
//                 $(lecturerCell).text(result[i]["lecturer"]);
//                 $(codeCell).appendTo($(row));
//                 $(nameCell).appendTo($(row));
//                 $(lecturerCell).appendTo($(row));
//                 $(row).appendTo($("#content"));
//             }
//         }
//         }

//     );
// }
