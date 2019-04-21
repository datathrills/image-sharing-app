$(function() {

    $(".upvote-default-btn:not(.upvote-non-clickable-btn)").on('click', function(event){
        console.log("button clicked!");
        event.stopPropagation();
        $.ajax({
            url: "/likes/" + $(this).attr('id'),
            type: "POST"
        }).done (function(result){
            $(".upvote-container > #" + String(result)).addClass("upvote-non-clickable-btn").off();
            const numberOfLikes = $(".upvote-container > .num-" + String(result)).text();
            $(".upvote-container > .num-" + String(result)).text(String(Number(numberOfLikes) + 1));
        }).fail(function(err){
            console.log(err);
        });
    });

    $("#upload-comment > .btn-comment").on('click', function(event){
        console.log("button clicked!");
        event.preventDefault();
        event.stopPropagation();
        const text = $("#comment-textarea").val();
        console.log(window.location.pathname);
        const data = JSON.stringify({message: text});

        $.ajax({
            url: window.location.pathname,
            type: "POST",
            //contentType: "application/json",
            data: {
                message: text
            }
        }).done (function(result){

            const postGenerator = '<div class="post"><div class="thread-info-cont"><div class="username">'+ result[0].username +'</div><div class="dateTime">'+ result[0].reply_timestamp +'</div></div><div class="thread-text">'+ result[0].reply_text +'</div></div>'

            $(".post-cont").append(postGenerator);
        }).fail(function(err){
            console.log(err);
        });
    });

});
