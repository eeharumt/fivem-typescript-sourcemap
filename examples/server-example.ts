// examples/server-example.ts
// FiveM TypeScript SourceMap Support - Server Side Example

import { 
    initializeSourceMapSupport, 
    enableDebugMode, 
    clearSourceMapCache 
  } from '../src/index';
  
  // ソースマップサポートを初期化（デバッグモード有効）
  initializeSourceMapSupport({ debug: true });
  
  console.log('FiveM TypeScript SourceMap Support - Server Example Started');
  
  // テスト用のエラー関数群
  class ErrorTestSuite {
    
    // 基本的なエラーテスト
    static basicErrorTest(): void {
      throw new Error('基本エラーテスト - この行番号がTypeScriptファイルで表示されるはずです');
    }
  
    // ネストした関数でのエラーテスト
    static nestedErrorTest(): void {
      const level1 = () => {
        const level2 = () => {
          const level3 = () => {
            throw new Error('ネストエラーテスト - 各レベルの正確な位置が表示されるはずです');
          };
          level3(); // この行も正確に表示される
        };
        level2(); // この行も正確に表示される
      };
      level1(); // この行も正確に表示される
    }
  
    // 非同期関数でのエラーテスト
    static async asyncErrorTest(): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 10));
      throw new Error('非同期エラーテスト - async/awaitでの正確な位置表示');
    }
  
    // クラスメソッドでのエラーテスト
    throwMethodError(): void {
      throw new Error('クラスメソッドエラーテスト - メソッド内での正確な位置表示');
    }
  
    // プロパティアクセスエラーテスト
    static propertyAccessError(): void {
      const obj: any = null;
      console.log(obj.nonExistentProperty); // TypeErrorが発生
    }
  
    // 型エラーのシミュレーション
    static typeErrorTest(): void {
      const str: string = "test";
      (str as any).nonExistentMethod(); // TypeErrorが発生
    }
  }
  
  // コマンド登録
  RegisterCommand('test-basic-error', () => {
    console.log('\n=== 基本エラーテスト開始 ===');
    try {
      ErrorTestSuite.basicErrorTest();
    } catch (error) {
      console.error('キャッチされたエラー:');
      console.error(error.stack);
    }
    console.log('=== 基本エラーテスト終了 ===\n');
  }, false);
  
  RegisterCommand('test-nested-error', () => {
    console.log('\n=== ネストエラーテスト開始 ===');
    try {
      ErrorTestSuite.nestedErrorTest();
    } catch (error) {
      console.error('キャッチされたエラー:');
      console.error(error.stack);
    }
    console.log('=== ネストエラーテスト終了 ===\n');
  }, false);
  
  RegisterCommand('test-async-error', async () => {
    console.log('\n=== 非同期エラーテスト開始 ===');
    try {
      await ErrorTestSuite.asyncErrorTest();
    } catch (error) {
      console.error('キャッチされたエラー:');
      console.error(error.stack);
    }
    console.log('=== 非同期エラーテスト終了 ===\n');
  }, false);
  
  RegisterCommand('test-method-error', () => {
    console.log('\n=== メソッドエラーテスト開始 ===');
    try {
      const testInstance = new ErrorTestSuite();
      testInstance.throwMethodError();
    } catch (error) {
      console.error('キャッチされたエラー:');
      console.error(error.stack);
    }
    console.log('=== メソッドエラーテスト終了 ===\n');
  }, false);
  
  RegisterCommand('test-property-error', () => {
    console.log('\n=== プロパティアクセスエラーテスト開始 ===');
    try {
      ErrorTestSuite.propertyAccessError();
    } catch (error) {
      console.error('キャッチされたエラー:');
      console.error(error.stack);
    }
    console.log('=== プロパティアクセスエラーテスト終了 ===\n');
  }, false);
  
  RegisterCommand('test-type-error', () => {
    console.log('\n=== 型エラーテスト開始 ===');
    try {
      ErrorTestSuite.typeErrorTest();
    } catch (error) {
      console.error('キャッチされたエラー:');
      console.error(error.stack);
    }
    console.log('=== 型エラーテスト終了 ===\n');
  }, false);
  
  // 全テストを実行
  RegisterCommand('test-all-errors', async () => {
    console.log('\n🚀 全エラーテスト開始 🚀\n');
    
    const tests = [
      { name: '基本エラー', fn: () => ErrorTestSuite.basicErrorTest() },
      { name: 'ネストエラー', fn: () => ErrorTestSuite.nestedErrorTest() },
      { name: '非同期エラー', fn: () => ErrorTestSuite.asyncErrorTest() },
      { name: 'メソッドエラー', fn: () => new ErrorTestSuite().throwMethodError() },
      { name: 'プロパティアクセスエラー', fn: () => ErrorTestSuite.propertyAccessError() },
      { name: '型エラー', fn: () => ErrorTestSuite.typeErrorTest() }
    ];
  
    for (const test of tests) {
      console.log(`\n--- ${test.name}テスト ---`);
      try {
        await test.fn();
      } catch (error) {
        console.error(`${test.name} - スタックトレース:`);
        console.error(error.stack);
      }
    }
    
    console.log('\n✅ 全エラーテスト完了 ✅\n');
  }, false);
  
  // ユーティリティコマンド
  RegisterCommand('sourcemap-debug-on', () => {
    enableDebugMode();
    console.log('ソースマップデバッグモードを有効にしました');
  }, false);
  
  RegisterCommand('sourcemap-debug-off', () => {
    console.log('ソースマップデバッグモードを無効にしました');
  }, false);
  
  RegisterCommand('sourcemap-clear-cache', () => {
    clearSourceMapCache();
    console.log('ソースマップキャッシュをクリアしました');
  }, false);
  
  // イベントハンドラーのテスト
  onNet('test-event-error', () => {
    console.log('\n=== イベントハンドラーエラーテスト ===');
    try {
      throw new Error('イベントハンドラー内でのエラー - 正確な位置が表示されるはずです');
    } catch (error) {
      console.error('イベントハンドラーエラー:');
      console.error(error.stack);
    }
  });
  
  // タイマーコールバックのテスト
  RegisterCommand('test-timer-error', () => {
    console.log('\n=== タイマーエラーテスト開始 ===');
    
    setTimeout(() => {
      try {
        throw new Error('setTimeout内でのエラー - コールバック位置が表示されるはずです');
      } catch (error) {
        console.error('タイマーエラー:');
        console.error(error.stack);
      }
    }, 100);
  }, false);
  
  // リソース停止時のクリーンアップ
  on('onResourceStop', (resourceName: string) => {
    if (GetCurrentResourceName() === resourceName) {
      console.log('リソース停止 - ソースマップサポートをクリーンアップ中...');
      clearSourceMapCache();
    }
  });
  
  // パフォーマンステスト
  RegisterCommand('test-performance', () => {
    console.log('\n=== パフォーマンステスト開始 ===');
    
    const iterations = 1000;
    const startTime = GetGameTimer();
    
    for (let i = 0; i < iterations; i++) {
      try {
        throw new Error(`パフォーマンステスト ${i}`);
      } catch (error) {
        // エラーオブジェクトを作成してスタックトレースを生成
        const stack = error.stack;
      }
    }
    
    const endTime = GetGameTimer();
    const duration = endTime - startTime;
    
    console.log(`${iterations}回のエラー処理時間: ${duration}ms`);
    console.log(`平均処理時間: ${(duration / iterations).toFixed(3)}ms/error`);
    console.log('=== パフォーマンステスト終了 ===\n');
  }, false);
  
  // ヘルプコマンド
  RegisterCommand('sourcemap-help', () => {
    console.log('\n📖 FiveM SourceMap Support - 使用可能コマンド 📖');
    console.log('');
    console.log('🧪 テストコマンド:');
    console.log('  test-basic-error     - 基本的なエラーテスト');
    console.log('  test-nested-error    - ネストした関数のエラーテスト');
    console.log('  test-async-error     - 非同期関数のエラーテスト');
    console.log('  test-method-error    - クラスメソッドのエラーテスト');
    console.log('  test-property-error  - プロパティアクセスエラーテスト');
    console.log('  test-type-error      - 型エラーテスト');
    console.log('  test-timer-error     - タイマーコールバックエラーテスト');
    console.log('  test-all-errors      - 全テストを実行');
    console.log('  test-performance     - パフォーマンステスト');
    console.log('');
    console.log('⚙️  ユーティリティコマンド:');
    console.log('  sourcemap-debug-on   - デバッグモード有効化');
    console.log('  sourcemap-debug-off  - デバッグモード無効化');
    console.log('  sourcemap-clear-cache - キャッシュクリア');
    console.log('  sourcemap-help       - このヘルプを表示');
    console.log('');
    console.log('🔥 イベントテスト:');
    console.log('  emit test-event-error - イベントハンドラーエラーテスト');
    console.log('');
  }, false);
  
  console.log('✅ FiveM SourceMap Support テストスイートが読み込まれました');
  console.log('💡 "sourcemap-help" コマンドで使用方法を確認できます');