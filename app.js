// Initialize Supabase client
const client = supabase.createClient(
    "https://oxmfadloxanzkpegffbp.supabase.co",
    "sb_publishable_ghsuhl5qpil0Jj7dah4rug_Y9mxA0NK"
);

window.client = client;

console.log("app.js loaded");

//Make addToGraph available to ALL pages
function addToGraph(id, composer_first, composer_last, title, arranger, mpublisher, mgrade) {
    const li = document.createElement("li");
    li.textContent = `${composer_first} ${composer_last} — ${title} — ${arranger} — ${mpublisher} — ${mgrade} `;

    // Create delete button
    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.style.marginLeft = "10px";
    btn.style.cursor = "pointer";

    // Delete handler
    btn.onclick = async () => {
        const { error } = await client
            .from("pieces")
            .delete()
            .eq("id", id);

        if (!error) {
            li.remove(); // remove from UI
        } else {
            console.error(error);
            alert("Failed to delete.");
        }
    };

    li.appendChild(btn);
    document.getElementById("graph").appendChild(li);
}


// Handle form submission ONLY if composerForm exists
const form = document.getElementById("composerForm");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const composer_first = document.getElementById("composer_first").value;
        const composer_last = document.getElementById("composer_last").value;
        const title = document.getElementById("title").value;
        const arranger = document.getElementById("arranger").value;
        const mpublisher = document.getElementById("mpublisher").value;
        const mgrade = document.getElementById("mgrade").value;

        const { data: userData } = await client.auth.getUser();
        const user = userData.user;

        if (!user) {
            alert("You must be logged in to add data.");
            return;
        }

        const { data, error } = await client
            .from("pieces")
            .insert([{
                composer_first,
                composer_last,
                title,
                arranger,
                mpublisher,
                mgrade,
                user_id: user.id
            }])
            .select(); // <-- this makes Supabase return the inserted row

        if (error) {
            console.error(error);
            return;
        }

        const row = data[0];

        addToGraph(
            row.id,
            row.composer_first,
            row.composer_last,
            row.title,
            row.arranger,
            row.mpublisher,
            row.mgrade
        );
    });
}

// ALWAYS load pieces on page load
window.onload = async () => {
    // Wait for Supabase to restore the session
    await client.auth.getSession();

    const { data, error } = await client
        .from("pieces")
        .select("*")
        .order("created_at", { ascending: true });

    if (data) {
        data.forEach(row =>
            addToGraph(
                row.id,
                row.composer_first,
                row.composer_last,
                row.title,
                row.arranger,
                row.mpublisher,
                row.mgrade
            )
        );
    }
};

// SIGN UP FORM
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;

        const { data, error } = await client.auth.signUp({ email, password });

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

        window.location.href = "archive.html";
    });
}
