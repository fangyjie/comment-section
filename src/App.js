import './App.scss'
// 当前用户头像地址
import avatar from './images/cat.jpg'
// 通过条件动态控制class类名的显示
import classNames from 'classnames'
// 排序工具包
import _ from 'lodash'
// 生成随机 id工具包
import { v4 as uuidv4 } from 'uuid'
// 格式化时间
import dayjs from 'dayjs'
// 发送网络请求
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'

// 当前登录用户信息
const user = {
  // 用户id
  uid: '30009257',
  // 用户头像
  avatar,
  // 用户昵称
  uname: 'fyj'
}
// 导航 Tab 数组
const tabs = [
  { type: 'hot', text: '最热' },
  { type: 'time', text: '最新' }
]

function useComment() {
  const [commentList, setCommentList] = useState([])
  const [commentCount, setCommentCount] = useState(0)
  useEffect(() => {
    async function getList() {
      const res = await axios.get('http://localhost:3001/list')
      setCommentList(_.orderBy(res.data, 'like', 'desc'))
      setCommentCount(res.data.length)
    }
    getList()
  }, [])
  return {
    commentList,
    setCommentList,
    commentCount,
    setCommentCount
  }
}

function Item({ item, onDel }) {
  return (
    <div className="reply-item">
      {/* 头像 */}
      <div className="root-reply-avatar">
        <div className="bili-avatar">
          <img className="bili-avatar-img" alt="" src={item.user.avatar} />
        </div>
      </div>

      <div className="content-wrap">
        {/* 用户名 */}
        <div className="user-info">
          <div className="user-name">{item.user.uname}</div>
        </div>
        {/* 评论内容 */}
        <div className="root-reply">
          <span className="reply-content">{item.content}</span>
          <div className="reply-info">
            {/* 评论时间 */}
            <span className="reply-time">{item.ctime}</span>
            {/* 评论点赞数量 */}
            <span className="reply-time">点赞数:{item.like}</span>
            {/* 条件：user.id === item.user.id */}
            {user.uid === item.user.uid && (
              <span className="delete-btn" onClick={() => onDel(item.rpid)}>
                删除
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const App = () => {
  // 渲染评论列表
  const { commentList, setCommentList, commentCount, setCommentCount } =
    useComment()
  // 渲染导航 Tab和高亮实现
  const [type, setType] = useState('hot')
  const [content, setContent] = useState('')
  // 获取 DOM元素
  const areaRef = useRef(null)
  // 删除评论实现
  const delComment = (rpid) => {
    setCommentList(commentList.filter((item) => item.rpid !== rpid))
    setCommentCount(commentCount - 1)
  }
  // 评论列表排序功能实现
  const changeType = (type) => {
    setType(type)
    if (type === 'hot') setCommentList(_.orderBy(commentList, 'like', 'desc'))
    else setCommentList(_.orderBy(commentList, 'ctime', 'desc'))
  }
  // 发表评论实现
  const pubComment = () => {
    setCommentList([
      ...commentList,
      {
        rpid: uuidv4(),
        user,
        content: content,
        ctime: dayjs(new Date()).format('MM-DD hh:mm'),
        like: 0
      }
    ])
    setCommentCount(commentCount + 1)
    setContent('')
    areaRef.current.focus()
  }
  return (
    <div className="app">
      {/* 导航 Tab */}
      <div className="reply-navigation">
        <ul className="nav-bar">
          <li className="nav-title">
            <span className="nav-title-text">评论</span>
            {/* 评论数量 */}
            <span className="total-reply">{commentCount}</span>
          </li>
          <li className="nav-sort">
            {/* 高亮类名： active */}
            {tabs.map((item) => (
              <span
                key={item.type}
                className={classNames('nav-item', {
                  active: type === item.type
                })}
                onClick={() => changeType(item.type)}
              >
                {item.text}
              </span>
            ))}
          </li>
        </ul>
      </div>

      <div className="reply-wrap">
        {/* 发表评论 */}
        <div className="box-normal">
          {/* 当前用户头像 */}
          <div className="reply-box-avatar">
            <div className="bili-avatar">
              <img className="bili-avatar-img" src={avatar} alt="用户头像" />
            </div>
          </div>
          <div className="reply-box-wrap">
            {/* 评论框 */}
            <textarea
              className="reply-box-textarea"
              placeholder="发一条友善的评论"
              value={content}
              ref={areaRef}
              onChange={(e) => setContent(e.target.value)}
            />
            {/* 发布按钮 */}
            <div className="reply-box-send">
              <div className="send-text" onClick={pubComment}>
                发布
              </div>
            </div>
          </div>
        </div>
        {/* 评论列表 */}
        <div className="reply-list">
          {/* 评论项 */}
          {commentList.map((item) => (
            <Item key={item.rpid} item={item} onDel={delComment} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
