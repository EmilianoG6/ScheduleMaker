use firebase::Firebase;
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Se configura la app de Firebase:
    let firebase = Firebase::configure("https://schedulemakerlmp-default-rtdb.firebaseio.com")?;

    // Se obtiene una referencia a nuestra base de datos
    let database = firebase.database();

    // Se lee los datos de Firebase
    let data = database.get("/clases.json").await?;
    println!("Datos leídos de Firebase: {:?}", data);

    Ok(())
}