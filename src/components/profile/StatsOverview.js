"use client";
import React from 'react';

function StatsOverview({ statistics }) {
    const stats = statistics?.anime;
    
    if (!stats) {
        return <div className="text-center py-10 text-gray-400">No statistics available</div>;
    }

    // Convert minutes to readable format
    const formatWatchTime = (minutes) => {
        if (!minutes) return { days: 0, hours: 0, minutes: 0 };
        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);
        const mins = minutes % 60;
        return { days, hours, minutes: mins };
    };

    const watchTime = formatWatchTime(stats.minutesWatched);

    // Color palette
    const colors = [
        '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
        '#06B6D4', '#EF4444', '#84CC16', '#F97316', '#6366F1'
    ];

    const statusColors = {
        'CURRENT': '#10B981',
        'COMPLETED': '#3B82F6', 
        'PAUSED': '#F59E0B',
        'DROPPED': '#EF4444',
        'PLANNING': '#8B5CF6'
    };

    // Calculate totals for pie chart
    const totalStatusCount = stats.statuses?.reduce((sum, s) => sum + s.count, 0) || 1;

    // Calculate max for bar widths
    const maxGenreCount = Math.max(...(stats.genres?.map(g => g.count) || [1]));
    const maxStudioCount = Math.max(...(stats.studios?.map(s => s.count) || [1]));
    const maxScoreCount = Math.max(...(stats.scores?.map(s => s.count) || [1]));
    const maxYearCount = Math.max(...(stats.releaseYears?.map(y => y.count) || [1]));

    // Sort release years chronologically for the chart
    const sortedYears = [...(stats.releaseYears || [])].sort((a, b) => a.releaseYear - b.releaseYear);

    return (
        <div className="space-y-6">
            {/* Hero Stats Section */}
            <div className="bg-gradient-to-br from-[#18181b] to-[#1f1f23] rounded-2xl p-6 border border-white/5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <HeroStat 
                        value={stats.count || 0} 
                        label="Total Anime"
                        gradient="from-blue-500 to-cyan-400"
                        icon="🎬"
                    />
                    <HeroStat 
                        value={stats.episodesWatched || 0} 
                        label="Episodes Watched"
                        gradient="from-purple-500 to-pink-400"
                        icon="▶️"
                    />
                    <div className="bg-[#27272a] rounded-xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full -mr-10 -mt-10" />
                        <span className="text-2xl mb-2 block">⏱️</span>
                        <div className="flex items-baseline gap-1 flex-wrap">
                            <span className="text-3xl font-bold text-pink-400">{watchTime.days}</span>
                            <span className="text-sm text-gray-400">days</span>
                            <span className="text-xl font-bold text-pink-300 ml-1">{watchTime.hours}</span>
                            <span className="text-xs text-gray-400">hrs</span>
                        </div>
                        <span className="text-sm text-gray-400">Watch Time</span>
                    </div>
                    <HeroStat 
                        value={stats.meanScore?.toFixed(1) || 0} 
                        label="Mean Score"
                        gradient="from-yellow-500 to-orange-400"
                        icon="⭐"
                        suffix="/100"
                    />
                </div>
            </div>

            {/* Score Distribution & Status Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution Chart */}
                {stats.scores?.length > 0 && (
                    <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="text-xl">📊</span>
                            Score Distribution
                        </h3>
                        <div className="flex items-end justify-between h-40 gap-1 px-2">
                            {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((score) => {
                                const scoreData = stats.scores.find(s => s.score === score);
                                const count = scoreData?.count || 0;
                                const height = maxScoreCount > 0 ? (count / maxScoreCount) * 100 : 0;
                                return (
                                    <div key={score} className="flex-1 flex flex-col items-center gap-1 group">
                                        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {count}
                                        </span>
                                        <div 
                                            className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-80"
                                            style={{ 
                                                height: `${Math.max(height, 4)}%`,
                                                background: `linear-gradient(to top, ${getScoreColor(score)}, ${getScoreColor(score)}99)`
                                            }}
                                        />
                                        <span className="text-xs text-gray-500">{score/10}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 flex justify-between text-xs text-gray-500">
                            <span>Low</span>
                            <span>High</span>
                        </div>
                    </div>
                )}

                {/* Status Distribution Donut */}
                {stats.statuses?.length > 0 && (
                    <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            Watch Status
                        </h3>
                        <div className="flex items-center gap-6">
                            {/* Donut Chart */}
                            <div className="relative w-32 h-32 flex-shrink-0">
                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                    {(() => {
                                        let currentOffset = 0;
                                        return stats.statuses.map((status, index) => {
                                            const percentage = (status.count / totalStatusCount) * 100;
                                            const dashArray = `${percentage} ${100 - percentage}`;
                                            const offset = currentOffset;
                                            currentOffset += percentage;
                                            return (
                                                <circle
                                                    key={status.status}
                                                    cx="18"
                                                    cy="18"
                                                    r="14"
                                                    fill="none"
                                                    strokeWidth="4"
                                                    stroke={statusColors[status.status] || colors[index]}
                                                    strokeDasharray={dashArray}
                                                    strokeDashoffset={-offset}
                                                    className="transition-all duration-500"
                                                />
                                            );
                                        });
                                    })()}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold">{stats.count}</span>
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="flex-1 space-y-2">
                                {stats.statuses.map((status) => (
                                    <div key={status.status} className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: statusColors[status.status] || '#666' }}
                                        />
                                        <span className="text-sm text-gray-300 flex-1">{formatStatusName(status.status)}</span>
                                        <span className="text-sm font-medium">{status.count}</span>
                                        <span className="text-xs text-gray-500">
                                            ({((status.count / totalStatusCount) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Release Years Timeline Chart */}
            {sortedYears.length > 0 && (
                <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">📅</span>
                        Anime by Release Year
                    </h3>
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex items-end gap-1 min-w-max px-2" style={{ height: '160px' }}>
                            {sortedYears.map((year, index) => {
                                const heightPercent = (year.count / maxYearCount) * 100;
                                const barColor = colors[index % colors.length];
                                return (
                                    <div key={year.releaseYear} className="flex flex-col items-center justify-end group" style={{ width: '36px', height: '100%' }}>
                                        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                                            {year.count}
                                        </span>
                                        <div 
                                            className="w-5 rounded-t-md transition-all duration-300 group-hover:w-7"
                                            style={{ 
                                                height: `${Math.max(heightPercent, 5)}%`,
                                                backgroundColor: barColor,
                                                minHeight: '8px'
                                            }}
                                        />
                                        <span className="text-[9px] text-gray-500 mt-2 -rotate-45 origin-center whitespace-nowrap">
                                            {year.releaseYear}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Genre & Studio Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Genre Distribution */}
                {stats.genres?.length > 0 && (
                    <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="text-xl">🏷️</span>
                            Top Genres
                        </h3>
                        <div className="space-y-3">
                            {stats.genres.slice(0, 8).map((genre, index) => (
                                <div key={genre.genre} className="group">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-300">{genre.genre}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">{genre.count} anime</span>
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                                                {genre.meanScore?.toFixed(0) || '-'}★
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                                            style={{ 
                                                width: `${(genre.count / maxGenreCount) * 100}%`,
                                                backgroundColor: colors[index % colors.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Studios Distribution */}
                {stats.studios?.length > 0 && (
                    <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="text-xl">🏢</span>
                            Favorite Studios
                        </h3>
                        <div className="space-y-3">
                            {stats.studios.slice(0, 8).map((studio, index) => (
                                <div key={studio.studio.name} className="group">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-300 truncate max-w-[60%]">{studio.studio.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">{studio.count}</span>
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                                                {studio.meanScore?.toFixed(0) || '-'}★
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                                            style={{ 
                                                width: `${(studio.count / maxStudioCount) * 100}%`,
                                                backgroundColor: colors[(index + 5) % colors.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Voice Actors & Staff */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Voice Actors */}
                {stats.voiceActors?.length > 0 && (
                    <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="text-xl">🎤</span>
                            Top Voice Actors
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {stats.voiceActors.slice(0, 8).map((va, index) => (
                                <div 
                                    key={va.voiceActor.name.full} 
                                    className="flex items-center gap-2 p-2 rounded-lg bg-[#27272a] hover:bg-[#303034] transition-colors"
                                >
                                    {va.voiceActor.image?.large ? (
                                        <img 
                                            src={va.voiceActor.image.large} 
                                            alt={va.voiceActor.name.full}
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                            style={{ backgroundColor: `${colors[index % colors.length]}30`, color: colors[index % colors.length] }}
                                        >
                                            {index + 1}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-200 truncate">{va.voiceActor.name.full}</p>
                                        <p className="text-xs text-gray-500">{va.count} roles</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Staff */}
                {stats.staff?.length > 0 && (
                    <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="text-xl">🎬</span>
                            Top Staff (Directors/Writers)
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {stats.staff.slice(0, 8).map((s, index) => (
                                <div 
                                    key={s.staff.name.full} 
                                    className="flex items-center gap-2 p-2 rounded-lg bg-[#27272a] hover:bg-[#303034] transition-colors"
                                >
                                    {s.staff.image?.large ? (
                                        <img 
                                            src={s.staff.image.large} 
                                            alt={s.staff.name.full}
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                            style={{ backgroundColor: `${colors[(index + 3) % colors.length]}30`, color: colors[(index + 3) % colors.length] }}
                                        >
                                            {index + 1}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-200 truncate">{s.staff.name.full}</p>
                                        <p className="text-xs text-gray-500">{s.count} works</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Episode Length & Format & Countries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Episode Length */}
                {stats.lengths?.length > 0 && (
                    <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="text-xl">⏰</span>
                            Episode Lengths
                        </h3>
                        <div className="space-y-2">
                            {stats.lengths.slice(0, 5).map((len, index) => (
                                <div 
                                    key={len.length || 'unknown'} 
                                    className="flex items-center justify-between p-2 rounded-lg"
                                    style={{ backgroundColor: `${colors[index % colors.length]}15` }}
                                >
                                    <span className="text-sm">{len.length || 'Unknown'}</span>
                                    <span className="text-sm font-medium">{len.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Format Distribution */}
                {stats.formats?.length > 0 && (
                    <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="text-xl">📺</span>
                            Formats
                        </h3>
                        <div className="space-y-2">
                            {stats.formats.map((format, index) => (
                                <div 
                                    key={format.format} 
                                    className="flex items-center justify-between p-2 rounded-lg"
                                    style={{ backgroundColor: `${colors[(index + 2) % colors.length]}15` }}
                                >
                                    <span className="text-sm">{formatName(format.format)}</span>
                                    <span className="text-sm font-medium">{format.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Countries */}
                {stats.countries?.length > 0 && (
                    <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span className="text-xl">🌍</span>
                            Countries
                        </h3>
                        <div className="space-y-2">
                            {stats.countries.map((country, index) => (
                                <div 
                                    key={country.country} 
                                    className="flex items-center justify-between p-2 rounded-lg"
                                    style={{ backgroundColor: `${colors[(index + 4) % colors.length]}15` }}
                                >
                                    <span className="text-sm flex items-center gap-2">
                                        {getCountryFlag(country.country)} {country.country}
                                    </span>
                                    <span className="text-sm font-medium">{country.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Tags Cloud */}
            {stats.tags?.length > 0 && (
                <div className="bg-[#18181b] rounded-xl p-5 border border-white/5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">🔖</span>
                        Favorite Tags & Themes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {stats.tags.map((tag, index) => {
                            return (
                                <span 
                                    key={tag.tag.name} 
                                    className="text-xs px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105 cursor-default"
                                    style={{ 
                                        backgroundColor: `${colors[index % colors.length]}20`,
                                        borderLeft: `2px solid ${colors[index % colors.length]}`
                                    }}
                                >
                                    {tag.tag.name}
                                    <span className="ml-1 text-gray-400 text-[10px]">({tag.count})</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Fun Facts */}
            <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-xl p-5 border border-white/5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    Fun Facts
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FunFact 
                        label="If you watched non-stop"
                        value={`${(stats.minutesWatched / 60 / 24).toFixed(1)} days`}
                        icon="🏃"
                    />
                    <FunFact 
                        label="Avg episodes per anime"
                        value={((stats.episodesWatched || 0) / (stats.count || 1)).toFixed(1)}
                        icon="📈"
                    />
                    <FunFact 
                        label="Score deviation"
                        value={`±${stats.standardDeviation?.toFixed(1) || '0'}`}
                        icon="📊"
                    />
                    <FunFact 
                        label="Most watched genre"
                        value={stats.genres?.[0]?.genre || 'N/A'}
                        icon="🏆"
                    />
                </div>
            </div>
        </div>
    );
}

// Hero Stat Component
function HeroStat({ value, label, gradient, icon, suffix = '' }) {
    return (
        <div className="bg-[#27272a] rounded-xl p-4 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-20 rounded-full -mr-10 -mt-10`} />
            <span className="text-2xl mb-2 block">{icon}</span>
            <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
                {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
            </div>
            <span className="text-sm text-gray-400">{label}</span>
        </div>
    );
}

// Fun Fact Component
function FunFact({ label, value, icon }) {
    return (
        <div className="text-center p-3 rounded-lg bg-white/5">
            <span className="text-2xl block mb-1">{icon}</span>
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
        </div>
    );
}

// Helper functions
function formatName(name) {
    if (!name) return '';
    return name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function formatStatusName(status) {
    const names = {
        'CURRENT': 'Watching',
        'COMPLETED': 'Completed',
        'PAUSED': 'Paused',
        'DROPPED': 'Dropped',
        'PLANNING': 'Planning'
    };
    return names[status] || status;
}

function getScoreColor(score) {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#3B82F6';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
}

function getCountryFlag(country) {
    const flags = {
        'JP': '🇯🇵',
        'CN': '🇨🇳',
        'KR': '🇰🇷',
        'TW': '🇹🇼',
        'US': '🇺🇸'
    };
    return flags[country] || '🌐';
}

export default StatsOverview;
