$(function() {

    $(".upvote-default-btn:not(.upvote-non-clickable-btn)").on('click', function(event){
        console.log("button clicked!");
        event.stopPropagation();
        $.ajax({
            url: "/likes/" + $(this).attr('id'),
            type: "POST"
        }).done (function(result){
            $(".upvote-container > #" + String(result)).addClass("upvote-non-clickable-btn");
            const numberOfLikes = $(".upvote-container > .num-" + String(result)).text();
            $(".upvote-container > .num-" + String(result)).text(String(Number(numberOfLikes) + 1));
        }).fail(function(err){
            console.log(err);
        });
    });

});
