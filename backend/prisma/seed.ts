import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.post.createMany({
    data: [
      {
        slug: 'hoang-de-cung-can-nhac-nho-ban-than',
        title: 'Hoàng đế cũng cần nhắc nhở bản thân',
        categories: ['TƯ DUY', 'MEDITATIONS'],
        date: '28 tháng 4, 2025',
        author: 'Hương Vũ',
        readTime: '5 phút',
        paragraphs: [
          'Sáng nay mình đọc đến đoạn này và phải gập sách lại, nhìn ra cửa một lúc lâu. Marcus Aurelius — một hoàng đế có trong tay mọi thứ — lại viết những điều này cho chính bản thân, không có ý định cho ai đọc.',
          'Đó là điều làm mình xúc động nhất: đây là một người đang cố gắng, từng ngày nhắc nhở mình. Meditations không phải là kho dạy đời. Nó là nhật ký tự nhắc nhở của một người đang cố sống đúng với điều họ tin.',
        ],
        embed: {
          type: 'quote',
          label: null,
          quote: 'Bạn có quyền năng đối với tâm trí của mình, không phải những sự kiện bên ngoài. Hãy nhận ra điều này và bạn sẽ tìm thấy sức mạnh.',
          attribution: 'Marcus Aurelius',
          source: 'Meditations',
          actionLabel: 'Tạo nhân',
        },
        afterEmbed: 'Mình nghĩ lý do cuốn sách này vẫn tồn tại được hơn 2000 năm không phải vì nó "khôn ngoan" — mà vì nó thành thật một cách không che giấu. Ai cũng có một Marcus Aurelius bên trong đang cố gắng nhắc mình đừng hổ thẹn với bản thân.',
        hashtags: ['#Marcus', '#MarcusAurelius', '#Triết'],
        likes: 0,
        comments: 0,
      },
      {
        slug: 'he-thong-quan-trong-hon-muc-tieu',
        title: 'Hệ thống quan trọng hơn mục tiêu',
        categories: ['VIDEO QUOTE', 'ATOMIC HABITS'],
        date: '24 tháng 3, 2025',
        author: 'Trà Giang',
        readTime: '4 phút',
        paragraphs: [
          'Lần này mình đọc đó là chưa lần. Không phải vì nó quá sắc sảo — mà vì nó thẳng thắn cái mình đã cảm nhận từ lâu mà chưa biết thành lời.',
        ],
        embed: {
          type: 'book-quote',
          label: 'ATOMIC HABITS • JAMES CLEAR',
          quote: 'Bạn không trưởng thành lên mức độ mục tiêu của mình. Bạn tụt xuống mức độ hệ thống của mình.',
          attribution: 'James Clear',
          source: 'Atomic Habits',
          actionLabel: 'Tạo nhân',
        },
        afterEmbed: 'James Clear không nói gì mới. Ông chỉ nói thứ chúng ta đã biết — nhưng nói theo cách khiến mình không thể tiếp tục làm lơ nó nữa.',
        hashtags: ['#AtomicHabits', '#ThóiQuen', '#TríchdẫnSách'],
        likes: 0,
        comments: 0,
      },
      {
        slug: 'lan-dau-tien-minh-cam-thay-nhe-nhom',
        title: 'Lần đầu tiên mình cảm thấy nhẹ nhõm vì không thông minh',
        categories: ['GHI CHÚ SÁCH'],
        date: '18 tháng 3, 2025',
        author: 'Tiên Vân',
        readTime: '6 phút',
        paragraphs: [
          'Mình đọc xong cuốn này lúc 11 giờ đêm và ngồi im một lúc không làm gì được. Kahneman dạy bạch cách não chúng ta thông minh hơn chúng ta tự nghĩ — trọng lý do chính là bản thân mình biết mình không thông minh hơn bạn theo những cách cực kỳ cụ thể.',
          'Và kỳ lạ thay, điều đó lại khiến mình cảm thấy nhẹ nhõm. Vì nếu ngay cả ai cũng như vậy, thì mình không cần tự trách mình nữa. Mình chỉ cần thiết kế lại môi trường để không bị não hại.',
        ],
        embed: {
          type: 'quote',
          label: null,
          quote: 'Bộ óc giống như con hổ — nó lớn mạnh qua luyện tập, và suy yếu khi không được dùng đến.',
          attribution: 'Daniel Kahneman',
          source: 'Thinking, Fast and Slow',
          actionLabel: 'Tạo nhân',
        },
        bookEmbed: {
          bookTitle: 'Thinking, Fast and Slow',
          bookAuthor: 'Daniel Kahneman',
          rating: 4.7,
          tags: ['Tâm lý học', 'Khoa học nhận thức', 'Ra quyết định'],
          pages: 499,
        },
        hashtags: ['#Fast', '#Kahneman', '#NhậnThức'],
        likes: 0,
        comments: 0,
      },
      {
        slug: 'bay-gio-sang-ca-phe-con-nong',
        title: '7 giờ sáng, cà phê còn nóng',
        categories: ['VIDEO QUOTE', 'THE POWER OF NOW'],
        date: '10 tháng 3, 2025',
        author: 'Nguyên An',
        readTime: '3 phút',
        paragraphs: [
          'Mình đọc câu này và tự hỏi bản thân — thực ra bạn đang ở đây lúc nào nhiều nhất phần trên? Không phải đi theo nghĩa vật lý. Mà theo nghĩa tâm trí mình đang ở đây, hay đâu khác?',
        ],
        embed: {
          type: 'book-quote',
          label: 'THE POWER OF NOW • ECKHART TOLLE',
          quote: 'Khoảnh khắc hiện tại luôn luôn là như này. Những gì bạn chống lại sẽ tồn tại.',
          attribution: 'Eckhart Tolle',
          source: 'The Power of Now',
          actionLabel: 'Tạo nhân',
        },
        afterEmbed: 'Câu trả lời của mình buổi sáng đó là khoảng 40%. Và mình nghĩ đó là một buổi sáng thật tốt rồi.',
        hashtags: ['#ThePowerOfNow', '#Mindfulness', '#EckhartTolle'],
        likes: 0,
        comments: 0,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.stats.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, books: 31, reviews: 47, videos: 12, recentDays: 7 },
  })

  await prisma.featuredQuote.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      quote: 'Bạn không cần phải vĩ đại để bắt đầu — nhưng bắt đầu để trở nên vĩ đại.',
      attribution: 'Zig Ziglar',
    },
  })

  const adminHash = '$2b$12$4FkpvbV2CrPpv.CDb/KcseL9BDNxnFEB9LuN0goBwYhePJOEelOsK'
  const existingAdmin = await prisma.$queryRaw`SELECT id FROM "AdminUser" WHERE username = 'readwellAdmin'` as any[]
  if (existingAdmin.length === 0) {
    await prisma.$executeRaw`INSERT INTO "AdminUser" (username, "passwordHash", "createdAt") VALUES ('readwellAdmin', ${adminHash}, NOW())`
  }

  console.log('Seed done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
