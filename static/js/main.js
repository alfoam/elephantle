
let dict = {};
let options = [];
let correct = "";

let guesses = [];

const input = document.getElementById("guess-input");
const dropdown = document.getElementById("dropdown-list");
const answers = document.getElementById("answers");

// fetch("/clear_guesses")
//   .then(res => res.json())
//   .then(data => {
//     if (data.clear_guesses) {
//       localStorage.removeItem("guesses");
//       guesses = [];
//       document.getElementById("answers").innerHTML = "";
//       // Optionally reset other UI stuff here
//     }
//   });

document.addEventListener("DOMContentLoaded", () => {
    fetch("/data")
    .then(res => res.json())
    .then(data => {
        const savedSeed = localStorage.getItem("seed");
        if (savedSeed !== data.seed) {
            // New day or seed changed → clear guesses
            localStorage.removeItem("guesses");
            guesses = [];
            document.getElementById("answers").innerHTML = "";
            localStorage.setItem("seed", data.seed);
        } else {
            // Same day → load guesses
            const savedGuesses = localStorage.getItem("guesses");
            if (savedGuesses) {
            guesses = JSON.parse(savedGuesses);
            guesses.forEach(name => createRow(name));
            }
        }

        dict = data.dict;
        options = Object.keys(dict);
        correct = data.correct;


    });

    // Call this when an answer is chosen
    function createRow(name) {
    const row = document.createElement("div");
    row.classList.add("row");

    for (let i = 0; i < 6; i++) {
        const square = document.createElement("div");
        square.classList.add("square");

        // animation logic
        square.style.color = "transparent";
        square.style.backgroundColor = "#121213";

        // Add flip class with delay
        square.style.animationDelay = `${i * 300}ms`;
        square.classList.add("flip");

        // if correct, disable input
        if (i == 0) {
            if (name === correct) {
                disableInputAndDropdown();
                const pleses = ["Numidotheriidae", "Barytheriidae"]
                // Show popup message
                var message = document.getElementById("correct-popup");
                var family = dict[correct][0][0];
                var elephant = "proboscidea";
                if(family == "Elephantidae"){
                    elephant = "elephant";
                }else if (family == "Mammutidae"){
                    elephant = "mastodon";
                }else if (pleses.includes(family)){
                    elephant = "plesielephantiform";
                }else if(family == "Basal Proboscidean"){
                    elephant = "elephant's ancestor"
                }else{
                    elephant = family.toLowerCase();
                }

                if(correct.includes("Mammuthus")){
                    elephant = "mammoth"
                }
                message.textContent = `you have addressed the ${elephant} in the room ✅`;
                message.classList.remove("hidden");

                // Show centered image
                const image = document.getElementById("correct-image");
                image.src = dict[correct][5];
                image.alt = correct;
                image.classList.remove("hidden")
                
                setTimeout(() => {
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 1800);
            }
        }

        // after half of the animation, reveal
        square.addEventListener("animationstart", () => {       

            // Using setTimeout to update at 50% (300ms)
            setTimeout(() => {
                if (i == 0) {
                    square.textContent = name;
                    const imgUrl = dict[name][5];
                    square.style.backgroundImage = `url('${imgUrl}')`;
                    square.style.backgroundSize = "cover";
                    square.style.backgroundPosition = "center";
                } else {
                    const listOfTraits = dict[name][i - 1];
                    const correctListOfTraits = dict[correct][i - 1];
                    square.textContent = listOfTraits.join(",\u200B ");

                    if (haveSameElements(listOfTraits, correctListOfTraits)) {
                        square.style.backgroundColor = "green";
                    } else if (shareAtLeastOneElement(listOfTraits, correctListOfTraits)) {
                        square.style.backgroundColor = "yellow";
                    } else if(i == 3){
                        const year = parseInt(listOfTraits[0]);
                        const correctYear = parseInt(correctListOfTraits[0]);
                        if (Math.floor(year / 100) * 100  == Math.floor(correctYear/100) *100){
                            square.style.backgroundColor = "yellow";
                        }
                    }else{
                        square.style.backgroundColor = "#121213"; // default
                    }
                }
                // Make text visible
                square.style.color = "white";
            }, 300); // 50% animation time
        }, { once: true }); // Run only once per square

        row.appendChild(square);
    }

    answers.insertBefore(row, answers.firstChild);
    }
  

    //logic for choosing an option
    input.addEventListener("input", () => {
        const value = input.value.toLowerCase();
        dropdown.innerHTML = "";

        const filtered = options.filter(option => {
            const lowerOption = option.toLowerCase();
            const data = dict[option];
            const discovered = (data?.[2] || "").toString();
            const family = Array.isArray(data?.[0]) ? data[0].join(" ").toLowerCase() : (data?.[0] || "").toLowerCase();
            const continent = Array.isArray(data?.[3]) ? data[3].join(" ").toLowerCase() : (data?.[3] || "").toLowerCase();

            return (
                lowerOption.includes(value) ||
                discovered.includes(value) ||
                family.includes(value) ||
                continent.includes(value)
            );
        });
        
        if (filtered.length === 0 || value === "") {
        dropdown.classList.add("hidden");
        return;
        }

        filtered.forEach(option => {
            const div = document.createElement("div");
            div.classList.add("dropdown-option");
            const discovered = dict[option]?.[2] || "unknown";
            div.innerHTML = `
                <div>${option}</div>
                <div style="font-size: 0.85em; color: #aaa;">(discovered in ${discovered})</div>
            `;

            div.addEventListener("mouseenter", () => {
                const imageUrl = dict[option][5]; // 
                const preview = document.getElementById("image-preview");
                const previewImg = document.getElementById("preview-img");
                previewImg.src = imageUrl;
                preview.classList.remove("hidden");

                // Position below the visible dropdown list container
                const dropdownList = document.getElementById("dropdown-list");
                const rect = dropdownList.getBoundingClientRect();

                const offset = 8; // pixels margin
                preview.style.top = `${rect.bottom + window.scrollY + offset}px`;

                // Center horizontally by CSS transform, so no left needed here
            });

            div.addEventListener("mouseleave", () => {
                document.getElementById("image-preview").classList.add("hidden");
            });

            div.addEventListener("click", () => {
                input.value = option;
                dropdown.classList.add("hidden");
                // guess logic
                console.log("You selected:", option);

                // remove option from list
                const index = options.indexOf(option);
                if (index > -1) options.splice(index, 1);
            
                // create the row
                createRow(option);
                guesses.push(option);
                localStorage.setItem("guesses", JSON.stringify(guesses));
                //clear input
                input.value = "";

            });
        dropdown.appendChild(div);
        });

        dropdown.classList.remove("hidden");
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!document.getElementById("dropdown-wrapper").contains(e.target)) {
        dropdown.classList.add("hidden");
        }
    });

    function haveSameElements(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;

        const sorted1 = [...arr1].sort();
        const sorted2 = [...arr2].sort();

        return sorted1.every((val, i) => val === sorted2[i]);
    }

    function shareAtLeastOneElement(arr1, arr2){
        return(arr1.some(item => arr2.includes(item)))
    }

    function disableInputAndDropdown() {
        if (input) {
            input.style.display = "none";   
        }
        if (dropdown) {
            dropdown.style.display = "none";  
        }
    }

    fetch("/next_reset")
    .then(res => res.json())
    .then(data => {
      const nextReset = new Date(data.next_reset);

      function updateCountdown() {
        const now = new Date();
        const diff = nextReset - now;

        if (diff <= 0) {
          document.querySelector(".timer-box").textContent = "Resetting now...";
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        document.querySelector(".timer-box").textContent =
          `${hours}h ${minutes}m ${seconds}s until reset`;
      }

      updateCountdown();
      setInterval(updateCountdown, 1000);
    })
    .catch(err => {
      console.error("Failed to load countdown:", err);
      document.querySelector(".timer-box").textContent = "Timer unavailable";
    });

});