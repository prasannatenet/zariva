export const menuItems = [
    {
        id: 1,
        label: "New In",
        href: "/new-in",
        slug: "new-in"
    },
    {
        id: 2,
        label: "Rings",
        href: "/rings",
        type: "mega",
        slug: "rings"
    },
    {
        id: 9,
        parent_id: 2,
        label: "Solitaire Rings",
        type: "mega",
        image: "https://astroemerging.com/gehna/storage/categories/MvDMfI1bMfLE1a1IjLBJFS2IPVt7mIRy05MIerKt.jpg",
        slug: "rings"
    },
    {
        id: 10,
        parent_id: 2,
        label: "Band Rings",
        type: "mega",
        image: "https://astroemerging.com/gehna/storage/categories/KnWRJ5RxUjcTHfW7l9VGPfDIAzt9YdURHMtN73ws.jpg",
        slug: "rings"
    },
    {
        id: 3,
        label: "Earrings",
        href: "/earrings",
        slug: "earrings"
    },
    {
        id: 4,
        label: "Pendants",
        href: "/pendants",
        slug: "pendants"
    },
    {
        id: 5,
        label: "Bracelets",
        href: "/bracelets",
        slug: "bracelets"
    },
    {
        id: 6,
        label: "Necklaces",
        href: "/necklaces",
        slug: "necklaces"
    },
    {
        id: 7,
        label: "Collections",
        href: "/collections",
        slug: "collections"
    },
    {
        id: 8,
        label: "More",
        type: "dropdown",
        slug: "more",
        children: [
            {
                label: "About Us",
                href: "/about",
                slug: "about-us"
            },
            {
                label: "Contact Us",
                href: "/contact",
                slug: "contact-us"
            },
            {
                label: "FAQs",
                href: "/faqs",
                slug: "faqs"
            },
            {
                label: "Blogs",
                href: "/blogs",
                slug: "blogs"
            },
        ],
    },
];

