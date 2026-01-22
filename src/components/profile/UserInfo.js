"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MediaCard from './MediaCard';
import StatsOverview from './StatsOverview';

function UserInfo({ lists, session, statistics }) {
    const mainTabs = [
        { name: "Lists", type: "lists" },
        { name: "Stats", type: "stats" }
    ];
    
    const [mainTab, setMainTab] = useState(mainTabs[0]);
    const [activeListTab, setActiveListTab] = useState(lists.find(tab => tab?.name === "Watching") || lists[0]);

    const handleMainTabClick = (e, tab) => {
        e.preventDefault();
        setMainTab(tab);
    };

    const handleListClick = (e, tab) => {
        e.preventDefault();
        setActiveListTab(tab);
    };

    const isMainSelected = (tab) => mainTab?.name === tab?.name;
    const isListSelected = (tab) => activeListTab?.name === tab?.name;

    return (
        <div>
            <div className="max-w-[95%] lg:max-w-[90%] xl:max-w-[86%] mx-auto">
                {/* Main Tabs: Lists / Stats */}
                <div className="flex mb-4 gap-2 border-b border-white/10 pb-2">
                    {mainTabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={(e) => handleMainTabClick(e, tab)}
                            className={[
                                "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                                isMainSelected(tab) 
                                    ? "bg-white text-black" 
                                    : "bg-white/10 text-gray-300 hover:bg-white/20",
                            ].join(" ")}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {mainTab.type === "lists" ? (
                        <motion.div
                            key="lists"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* List Sub-tabs */}
                            <div className="flex mb-3 flex-nowrap overflow-x-auto scrollbar-hide">
                                {lists.map((tab) => (
                                    <div
                                        key={tab.name}
                                        className={[
                                            "relative p-1 my-1 mx-3 cursor-pointer text-[#A1A1AA] transition-opacity duration-250 ease-in-out hover:opacity-60 text-lg sm:text-xl font-medium",
                                            isListSelected(tab) ? "!text-white !opacity-100" : "",
                                        ].join(" ")}
                                    >
                                        <div key={tab.name} onClick={(e) => handleListClick(e, tab)} className="flex flex-row items-center">
                                            {tab.name} <span className="ml-2 text-base">({tab?.entries?.length})</span>
                                        </div>
                                        {isListSelected(tab) && (
                                            <motion.div layoutId="listIndicator" className="absolute !h-[1px] bottom-0 left-0 right-0 bg-white" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeListTab.name || "empty"}
                                    initial="initial"
                                    animate="enter"
                                    exit="exit"
                                    transition={{
                                        duration: 0.3,
                                    }}
                                >
                                    <div className="mx-3 my-5 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4 !gap-y-8">
                                        {activeListTab &&
                                            activeListTab.entries
                                                .slice()
                                                .sort((a, b) => b.updatedAt - a.updatedAt)
                                                .map((anime) => (
                                                    <MediaCard key={anime.id} anime={anime} session={session}/>
                                                ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="mx-3 my-5"
                        >
                            <StatsOverview statistics={statistics} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default UserInfo;