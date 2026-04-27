// Initialize Supabase client
const client = supabase.createClient(
    "https://oxmfadloxanzkpegffbp.supabase.co",
    "sb_publishable_ghsuhl5qpil0Jj7dah4rug_Y9mxA0NK"
);

window.client = client; // expose globally

console.log("app.js loaded");

// Handle form submission ONLY if composerForm exists
const form = document.getElementById("composerForm");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const composer_first = document.getElementById("composer_first").value;
        const composer_last = document.getElementById("composer_last").value;
        const title = document.getElementById("title").value;

        // Get logged-in user
        const { data: userData } = await client.auth.getUser();
        const user = userData.user;

        if (!user) {
            alert("You must be logged in to add data.");
            return;
        }

        console.log("USER:", user.id);

        // Insert into Supabase
        const { data: insertData, error: insertError } = await client
            .from("pieces")
            .insert([{
                composer_first,
                composer_last,
                title,
                user_id: user.id
            }]);

        if (insertError) {
            console.error(insertError);
            return;
        }

        addToGraph(composer_first, composer_last, title);
    });

    // Add item to the graph list
    function addToGraph(composer_first, composer_last, title) {
        const li = document.createElement("li");
        li.textContent = `${composer_first} ${composer_last} — ${title}`;
        document.getElementById("graph").appendChild(li);
    }

    // Load existing pieces on page load
    window.onload = async () => {
        const { data, error } = await client
            .from("pieces")
            .select("*")
            .order("created_at", { ascending: true });

        if (data) {
            data.forEach(row =>
                addToGraph(row.composer_first, row.composer_last, row.title)
            );
        }
    };
}

// SIGN UP FORM
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;

        const { data, error } = await client.auth.signUp({
            email,
            password
        });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Check your email to confirm your account.");
    });
}

// LOGIN FORM
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert(error.message);
            return;
        }

        // Redirect to archive page after login
        window.location.href = "archive.html";
    });
}
