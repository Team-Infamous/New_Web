"use client";
import React, { useRef, useState } from 'react';
import styles from '../../styles/Animecard.module.css';
import { useDraggable } from 'react-use-draggable-scroll';
import Image from 'next/image';
import Link from 'next/link';

function Staff({ data }) {
    const containerRef = useRef();
    const { events } = useDraggable(containerRef);
    const [isLeftArrowActive, setIsLeftArrowActive] = useState(false);
    const [isRightArrowActive, setIsRightArrowActive] = useState(false);

    function handleScroll() {
        const container = containerRef.current;
        const scrollPosition = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        setIsLeftArrowActive(scrollPosition > 30);
        setIsRightArrowActive(scrollPosition < maxScroll - 30);
    }

    const smoothScroll = (amount) => {
        const container = containerRef.current;
        const cont = document.getElementById("staffcardid");

        if (cont && container) {
            cont.classList.add('scroll-smooth');
            container.scrollLeft += amount;

            setTimeout(() => {
                cont.classList.remove('scroll-smooth');
            }, 300);
        }
    };

    function scrollLeft() {
        smoothScroll(-500);
    }

    function scrollRight() {
        smoothScroll(500);
    }

    if (!data || data.length === 0) {
        return <div className="text-center mt-4">No staff information available.</div>;
    }

    return (
        <div className={styles.animecard}>
            <div className={styles.animeitems}>
                <span className={`${styles.leftarrow} ${isLeftArrowActive ? styles.active : styles.notactive}`}>
                    <svg onClick={scrollLeft} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-4"><path d="m15 18-6-6 6-6"></path></svg>
                </span>
                <span className={`${styles.rightarrow} ${isRightArrowActive ? styles.active : styles.notactive}`}>
                    <svg onClick={scrollRight} xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-4"><path d="m9 18 6-6-6-6"></path></svg>
                </span>
                <div className={styles.cardcontainer} id="staffcardid" {...events} ref={containerRef} onScroll={handleScroll}>
                    {data.map((staff, index) => (
                       <Link href={`/catalog?search=${encodeURIComponent(staff?.node?.name?.userPreferred || staff?.node?.name?.full)}`} className='h-full' key={index}>
                           <div
                               className="w-[135px] md:w-[155px] xl:w-[175px] h-[200px] md:h-[230px] xl:h-[265px] relative rounded-lg cursor-pointer flex-shrink-0"
                           >
                               <Image
                                   className="w-full h-full rounded-lg object-cover"
                                   src={staff?.node?.image?.large}
                                   alt={staff?.node?.name?.full}
                                   width={170}
                                   height={230}
                               />
                               <div className="p-2 absolute top-0 left-0 align-bottom flex flex-col-reverse w-full h-full bg-gradient-to-b from-transparent via-transparent to-black rounded-lg">
                                   <div className="font-medium text-xs opacity-80 text-white truncate" title={staff.role}>{staff.role}</div>
                                   <div className="font-semibold text-white text-sm truncate" title={staff?.node?.name?.full}>
                                       {staff?.node?.name?.full}
                                   </div>
                               </div>
                           </div>
                       </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Staff;
