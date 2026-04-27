// Initialize Supabase client
const supabase = supabase.createClient(
    "https://oxmfadloxanzkpegffbp.supabase.co",
    "sb_publishable_ghsuhl5qpil0Jj7dah4rug_Y9mxA0NK"
);

// Handle form submission
document.getElementById("composerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values
    const composer_first = document.getElementById("composer_first").value;
    const composer_last = document.getElementById("composer_last").value;
    const title = document.getElementById("title").value;

    // Get logged-in user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
        alert("You must be logged in to add data.");
        return;
    }

    console.log("USER:", user.id);

    // Insert into Supabase
    const { data: insertData, error: insertError } = await supabase
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
    const { data, error } = await supabase
        .from("pieces")
        .select("*")
        .order("created_at", { ascending: true });

    if (data) {
        data.forEach(row =>
            addToGraph(row.composer_first, row.composer_last, row.title)
        );
    }
};