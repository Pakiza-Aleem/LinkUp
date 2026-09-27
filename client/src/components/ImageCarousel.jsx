import { useState } from 'react';
import Slider from 'react-slick';
import Icon from './Icon';
import './ImageCarousel.css';

// Custom previous / next buttons for React Slick.
// Slick passes extra props to arrows, so we only pick the ones we need.
function Arrow({ direction, className, onClick }) {
  const disabled = className?.includes('slick-disabled');
  return (
    <button
      type="button"
      className={`carousel-arrow carousel-arrow--${direction}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous image' : 'Next image'}
    >
      <Icon name={direction === 'prev' ? 'chevronLeft' : 'chevronRight'} size={20} />
    </button>
  );
}

// One image, with a friendly fallback if the link is broken.
function PostImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="post-image post-image--broken">Image could not be loaded</div>;
  return <img className="post-image" src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

// One image -> plain picture.  Several images -> React Slick carousel.
export default function ImageCarousel({ images, author }) {
  if (!images || images.length === 0) return null;

  const altFor = (index) =>
    images.length === 1 ? `Photo posted by ${author}` : `Photo ${index + 1} of ${images.length} posted by ${author}`;

  if (images.length === 1) {
    return <div className="post-media"><PostImage src={images[0]} alt={altFor(0)} /></div>;
  }

  const settings = {
    dots: true,
    dotsClass: 'carousel-dots',
    customPaging: (i) => <button type="button" aria-label={`Go to image ${i + 1}`} />,
    infinite: false,
    speed: 350,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <Arrow direction="prev" />,
    nextArrow: <Arrow direction="next" />,
  };

  return (
    <div className="post-media post-media--carousel">
      <Slider {...settings}>
        {images.map((src, index) => (
          <div key={src + index}>
            <PostImage src={src} alt={altFor(index)} />
          </div>
        ))}
      </Slider>
    </div>
  );
}
