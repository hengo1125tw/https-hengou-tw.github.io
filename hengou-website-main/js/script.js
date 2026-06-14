const slides = [
  "images/products/paper-cushion/06.jpg",
  "images/products/paper-cushion/04.jpg",
  "images/products/paper-cushion/03.jpg",
  "images/products/paper-cushion/02.jpg",
  "images/products/paper-cushion/main.jpg",
  "images/products/paper-cushion/01.jpg"
];

let currentSlide = 0;

function showSlide(index){
  const image = document.getElementById("carousel-image");
  const dots = document.querySelectorAll(".dot");

  if(!image) return;

  if(index >= slides.length){
    currentSlide = 0;
  }else if(index < 0){
    currentSlide = slides.length - 1;
  }else{
    currentSlide = index;
  }

  image.src = slides[currentSlide];

  dots.forEach(dot => dot.classList.remove("active"));
  if(dots[currentSlide]){
    dots[currentSlide].classList.add("active");
  }
}

function changeSlide(direction){
  showSlide(currentSlide + direction);
}

function setSlide(index){
  showSlide(index);
}
