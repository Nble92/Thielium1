export function ProfileStats({ stats }) {
    return (
        <div className="flex flex-col gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.publications}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Publications</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.citations}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Citations</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.nftsSold}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">NFTs Sold</p>
            </div>
        </div>
    );
}