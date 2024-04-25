var speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = new speechRecognition();
var textbox = $("#textbox");
var instructions = $("#instructions");
var content = '';
var isListening = false; // Variable to track if recognition is ongoing
var timerElement = $("#timer");
var minutes = 0;
var seconds = 0;

if (!speechRecognition) {
    instructions.text("Speech recognition is not supported in this browser.");
} else {
    recognition.continuous = true;

    recognition.onstart = function() {
        instructions.text("Voice recognition has started");
        // Start the timer
        timerInterval = setInterval(updateTimer, 5000);
    }

    recognition.onspeechend = function() {
        instructions.text("No activity");
        // Pause the timer
        clearInterval(timerInterval);
    }

    recognition.onerror = function() {
        instructions.text("Try again");
        // Pause the timer
        clearInterval(timerInterval);
    }

    recognition.onresult = function(event) {
        var current = event.resultIndex;
        var transcript = event.results[current][0].transcript;
        var currentTime = timerElement.text();
        content += currentTime + " " + transcript + "\n"; // Append timer value to each line
        textbox.val(timerElement.text() + " " + content); // Update textarea with timer value and transcribed text
    }

    $("#start-btn").click(function(event) {
        if (!isListening) {
            // Start recognition if not already listening
            recognition.start();
            isListening = true;

            // Toggle between two SVGs
            $("#svg1").hide(); // Hide SVG 1
            $("#svg2").show(); // Show SVG 2
        } else {
            // Stop recognition if already listening
            recognition.stop();
            isListening = false;

            // Toggle between two SVGs
            $("#svg1").show(); // Show SVG 1
            $("#svg2").hide(); // Hide SVG 2
        }
    });

    textbox.on('input', function() {
        content = $(this).val() + ",";
    });
}

// Function to update timer
function updateTimer() {
    seconds += 5;
    if (seconds >= 60) {
        minutes++;
        seconds = 0;
    }
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    timerElement.text(`${formattedMinutes}:${formattedSeconds}`);
}


$("#ask-btn").click(function(event) {
    var userInput = $("#response-textbox").val(); // Get user input from response textbox
    var content = $("#textbox").val(); // Get content from the textbox
    var promptText = content + "\n" + userInput + " :";
    
    // Call OpenAI API to generate response
    $.ajax({
        url: 'https://api.openai.com/v1/completions',
        type: 'POST',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer API_KEY');
        },
        data: JSON.stringify({
            model: 'gpt-3.5-turbo', // You can choose a different model if needed
            prompt: promptText,
            max_tokens: 100 // Adjust as needed
        }),
        success: function(data) {
            var response = data.choices[0].text.trim(); // Get the generated response
            $("#response-textbox").val(response); // Display response in the response textbox
        },
        error: function(xhr, status, error) {
            console.error(xhr.responseText); // Log any errors to the console
            $("#response-textbox").val("Error occurred. Please try again."); // Display error message
        }
    });
});



