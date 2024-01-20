use wasm_bindgen::prelude::*;
use std::io::{self, Read, Write, Cursor};
use audiotags::{Tag, Picture, MimeType};


#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn sum(numbers: &[i32]) -> i32 {
    let sum:i32 = numbers.iter().sum();
    return sum + 1;
}

#[wasm_bindgen]
pub fn get_tags(url: &str) {
    let mut tag = Tag::new().read_from_path("test.mp3").unwrap();
    log(url);
    match Tag::new().read_from_path(url) {
        Ok(tag) => {
            // Successful read, proceed with `tag`
            log("2");
            let title = tag.title();
            log("3");
            match title {
                Some(value) => {
                    log(value);
                }
                None => {
                    log("sad.");
                }
            }
        },
        Err(e) => {
            // Handle error, e.g., log it or return it
            eprintln!("Error reading tag: {:?}", e);
        },
    }
}
// learn rust this is impossible.
// stop doubting.