import { useState } from "react";
import earringsImage from "../../assets/images/category/Earrings.jpg";
import ringsImage from "../../assets/images/category/Rings.jpg";
import pendantImage from "../../assets/images/category/Pendent.jpg";
import braceletImage from "../../assets/images/category/Bangles-Bracelet.jpg";
import jewellerySetImage from "../../assets/images/category/Jewellery-Sets.jpg";
import chainImage from "../../assets/images/category/Chain.jpg";
import mangalsutraImage from "../../assets/images/category/Mangalsutra.jpg";
import firstReel from "../../assets/images/371403_medium.mp4";
import secondReel from "../../assets/images/316570_medium.mp4";
import Button from "../Button/Button";
import "./InstagramSection.css";

const phoneReels = [firstReel, secondReel];

const fallbackPosts = [
    { image: earringsImage, caption: "A little sparkle for every day" },
    { image: ringsImage, caption: "Made for your forever moments" },
    { image: pendantImage, caption: "The details make the difference" },
    { image: braceletImage, caption: "Your everyday, elevated" },
    { image: jewellerySetImage, caption: "A look to remember" },
    { image: chainImage, caption: "Layer on a little love" },
    { image: mangalsutraImage, caption: "Find your signature sparkle" },
    { image: earringsImage, caption: "Celebrate beautifully" },
];

const instagramProfileUrl = "https://www.instagram.com/asuhjewelscrafts/";

function InstagramSection({ products = [] }) {
    const [activeReelIndex, setActiveReelIndex] = useState(0);
    const productPosts = products
        .filter((product) => product.primary_image || product.images?.[0])
        .map((product) => ({
            image: product.primary_image || product.images[0],
            caption: product.name,
            slug: product.slug,
        }));
    const posts = [...productPosts, ...fallbackPosts].slice(0, 12);
    const columns = [
        [...posts].reverse(),
        [...posts.slice(2), ...posts.slice(0, 2)],
        posts,
    ];

    return (
        <section className="instagram-section" aria-labelledby="instagram-section-title">
            <div className="instagram-section__inner">
                <div className="instagram-section__intro">
                    <a
                        className="instagram-section__profile"
                        href={instagramProfileUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Visit asuhjewelscrafts on Instagram"
                    >
                        <span className="instagram-section__avatar" aria-hidden="true">Z</span>
                        <span className="instagram-section__profile-copy">
                            <strong id="instagram-section-title">@asuhjewelscrafts</strong>
                            <span>Daily inspiration for mindful adornment.</span>
                        </span>
                    </a>
                    <Button
                        text="Follow Us"
                        onClick={() => window.open(instagramProfileUrl, "_blank", "noopener,noreferrer")}
                        className="instagram-section__follow"
                    />
                </div>

                <a
                    className="instagram-section__phone"
                    href={instagramProfileUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Watch Instagram reel from asuhjewelscrafts"
                >
                    <div className="instagram-section__phone-screen">
                        <div className="instagram-section__phone-notch" aria-hidden="true" />
                        <header className="instagram-section__phone-header">
                            <span className="instagram-section__mini-avatar">Z</span>
                            <span>
                                <strong>@asuhjewelscrafts</strong>
                                <small>Jewellery &amp; lifestyle</small>
                            </span>
                            <span className="material-symbols-outlined" aria-hidden="true">more_horiz</span>
                        </header>
                        <div className="instagram-section__phone-post">
                            <video
                                key={phoneReels[activeReelIndex]}
                                className="instagram-section__phone-reel"
                                src={phoneReels[activeReelIndex]}
                                autoPlay
                                muted
                                playsInline
                                onEnded={() => setActiveReelIndex((index) => (index + 1) % phoneReels.length)}
                            />
                            <span className="instagram-section__post-count">
                                {String(activeReelIndex + 1).padStart(2, "0")} / {String(phoneReels.length).padStart(2, "0")}
                            </span>
                        </div>
                        <div className="instagram-section__phone-actions" aria-hidden="true">
                            <span className="material-symbols-outlined">favorite</span>
                            <span className="material-symbols-outlined">chat_bubble_outline</span>
                            <span className="material-symbols-outlined">send</span>
                            <span className="material-symbols-outlined instagram-section__bookmark">bookmark_border</span>
                        </div>
                        <p className="instagram-section__phone-caption">
                            <strong>asuhjewelscrafts</strong> A little sparkle in motion.
                        </p>
                        <div className="instagram-section__phone-home-indicator" aria-hidden="true" />
                    </div>
                </a>

                <div className="instagram-section__feed" role="region" aria-label="Latest Instagram posts">
                    {columns.map((column, columnIndex) => (
                        <div
                            className={`instagram-section__feed-column instagram-section__feed-column--${columnIndex + 1}`}
                            key={`column-${columnIndex}`}
                        >
                            <div className="instagram-section__feed-track">
                                {[0, 1].map((copy) => (
                                    <div
                                        className="instagram-section__feed-group"
                                        key={`group-${copy}`}
                                        aria-hidden={copy === 1}
                                    >
                                        {column.map((post, postIndex) => (
                                            <a
                                                className="instagram-section__feed-post"
                                                href={post.slug ? `/product/${post.slug}` : instagramProfileUrl}
                                                target={post.slug ? undefined : "_blank"}
                                                rel={post.slug ? undefined : "noreferrer"}
                                                key={`${post.image}-${postIndex}`}
                                                tabIndex={copy === 1 ? -1 : undefined}
                                                aria-label={`View post: ${post.caption}`}
                                            >
                                                <img src={post.image} alt="" loading="lazy" />
                                                <span className="instagram-section__feed-overlay">
                                                    <span className="material-symbols-outlined" aria-hidden="true">favorite</span>
                                                    {post.caption}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default InstagramSection;
