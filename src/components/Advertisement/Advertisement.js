import React, { useState } from 'react';
import {
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    CarouselCaption,
    Container
} from 'reactstrap';

import bread from '../../assets/img/bread.png'
import jelly from '../../assets/img/jelly.png'
import covid from '../../assets/img/covid-ad.png'

const items = [
    {
        id: 1,
        altText: 'Advertisement from sponsor Bread Pitt',
        caption: 'Sponsored by BREAD PITT',
        src: bread
    },
    {
        id: 2,
        altText: "Advertisement from our sponsor Angelina's Jelly",
        caption: "Sponsored by Angelina's Jelly",
        src: jelly
    },
    {
        id: 3,
        altText: 'Advertisement to wear masks',
        caption: 'Slide 3',
        src: covid
    }
];

const Advertisement = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const next = () => {
        if (animating) return;
        const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
    }

    const previous = () => {
        if (animating) return;
        const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
        setActiveIndex(nextIndex);
    }

    const goToIndex = (newIndex) => {
        if (animating) return;
        setActiveIndex(newIndex);
    }

    const slides = items.map((item) => {
        return (
            <CarouselItem
                className="custom-tag"
                tag="div"
                key={item.id}
                onExiting={() => setAnimating(true)}
                onExited={() => setAnimating(false)}
            >
                <img src={item.src} alt={item.altText} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {/* <CarouselCaption className="text-light" captionText={item.caption} captionHeader={item.caption} /> */}
            </CarouselItem>
        );
    });

    return (
        <Container>
            <div>
                <style>
                    {
                        `.custom-tag {
              max-width: 100%;
              height: 300px;
              background: black;
            }`
                    }
                </style>
                <Carousel
                    activeIndex={activeIndex}
                    next={next}
                    previous={previous}
                >
                    <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
                    {slides}
                    <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
                    <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
                </Carousel>
            </div>
        </Container>
    )
}

export default Advertisement
